// src/screens/StatisticsScreen.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import {
  format,
  parseISO,
  isAfter,
  isSameMonth,
  isSameDay,
  getDate,
  startOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  startOfYear,
  addMonths,
  getYear,
  subDays
} from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from 'react-native-calendars';
import { supabase } from '../services/supabase';
import { UserContext } from '../context/UserContext';
import TopBar from '../components/TopBar';

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 32;

function formatNumber(n) {
  return n >= 10000 ? (n / 1000).toFixed(1) + 'k' : n.toString();
}

export default function StatisticsScreen() {
  const navigation = useNavigation();
  const { user } = useContext(UserContext);

  const [progressData, setProgressData] = useState([]);
  const [pagesRead, setPagesRead] = useState(0);
  const [booksFinished, setBooksFinished] = useState(0);
  const [period, setPeriod] = useState('week');
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [chartTitle, setChartTitle] = useState('');
  const [media, setMedia] = useState(null);
  const [ultimosLeidos, setUltimosLeidos] = useState([]);
  const [diasLeidos, setDiasLeidos] = useState({});
  const [rachaActual, setRachaActual] = useState(0);
  const [mejorRacha, setMejorRacha] = useState(0);

  const fetchProgress = async () => {
    const { data, error } = await supabase
      .from('reading_logs')
      .select('created_at, pages_read')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error al obtener logs de lectura', error);
      return;
    }

    const fechas = {};
    const hoy = new Date();
    let rachaHoy = 0;
    let mejor = 0;
    let actual = 0;

    const fechasUnicas = [...new Set(data.map(e => e.created_at))]
      .filter(Boolean)
      .map(d => parseISO(d))
      .sort((a, b) => a - b);

    fechasUnicas.forEach(d => {
      const clave = format(d, 'yyyy-MM-dd');
      fechas[clave] = {
        selected: true,
        selectedColor: '#34c759',
        selectedTextColor: '#fff'
      };
    });

    for (let i = 0; i < fechasUnicas.length; i++) {
      if (i === 0) {
        actual = 1;
      } else {
        const anterior = fechasUnicas[i - 1];
        const actualFecha = fechasUnicas[i];
        const diferencia = (actualFecha - anterior) / (1000 * 60 * 60 * 24);
        if (diferencia === 1) {
          actual++;
        } else {
          mejor = Math.max(mejor, actual);
          actual = 1;
        }
      }
    }

    mejor = Math.max(mejor, actual);

    for (let i = 0; i < fechasUnicas.length; i++) {
      const fecha = fechasUnicas[fechasUnicas.length - 1 - i];
      const esperada = subDays(hoy, i);
      if (isSameDay(fecha, esperada)) {
        rachaHoy++;
      } else {
        break;
      }
    }

    setDiasLeidos(fechas);
    setRachaActual(rachaHoy);
    setMejorRacha(mejor);
  };

  const fetchResumen = async () => {
    const { data, error } = await supabase
      .from('reading_progress')
      .select('book_id, current_page, total_pages, updated_at, books (id, cover_url)')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error al obtener progreso', error);
      return;
    }

    setProgressData(data || []);

    const librosTerminados = data.filter(
      r => r.finished || r.current_page >= r.total_pages
    );

    setBooksFinished(librosTerminados.length);

    const paginasTotales = data.reduce((sum, r) => sum + (r.current_page || 0), 0);
    setPagesRead(paginasTotales);

    const ultimos = librosTerminados
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, 3);

    setUltimosLeidos(ultimos);
  };

  const periodOptions = [
    { key: 'week', label: 'Esta semana' },
    { key: 'month', label: 'Este mes' },
    { key: 'year', label: 'Este año' }
  ];

  useFocusEffect(
    useCallback(() => {
      fetchResumen();
      fetchProgress();
    }, [user.id])
  );

  useEffect(() => {
    const now = new Date();
    let dates = [];
    let labels = [];
    let chartLabel = '';

    if (period === 'week') {
      const base = startOfWeek(now, { weekStartsOn: 1 });
      for (let i = 0; i < 7; i++) {
        const date = addDays(base, i);
        dates.push(date);
        labels.push(['L', 'M', 'X', 'J', 'V', 'S', 'D'][i]);
      }
      chartLabel = 'Esta semana';
    }

    if (period === 'month') {
      const startMonth = startOfMonth(now);
      const endMonth = endOfMonth(now);
      for (
        let d = new Date(startMonth);
        !isAfter(d, endMonth);
        d.setDate(d.getDate() + 1)
      ) {
        const date = new Date(d);
        dates.push(date);
        const dia = getDate(date);
        labels.push([1, 5, 10, 15, 20, 25, 30].includes(dia) ? String(dia) : '');
      }
      chartLabel = 'Mes de ' + format(now, 'LLLL', { locale: es }).replace(/^./, c => c.toUpperCase());
    }

    if (period === 'year') {
      const start = startOfYear(now);
      for (let i = 0; i < 12; i++) {
        const date = addMonths(start, i);
        if (isAfter(date, now)) break;
        dates.push(date);
        labels.push(format(date, 'LLL', { locale: es }).toUpperCase());
      }
      chartLabel = `${getYear(now)}`;
    }

    const today = new Date();
    const sums = {};

    if (period === 'year') {
      dates.forEach((monthDate, i) => {
        const total = progressData.reduce((sum, r) => {
          const logDate = parseISO(r.updated_at);
          return isSameMonth(logDate, monthDate)
            ? sum + (r.current_page || 0)
            : sum;
        }, 0);
        sums[i] = total;
      });
    } else {
      progressData.forEach(r => {
        const dateStr = r.updated_at?.slice(0, 10);
        if (dateStr) {
          const d = parseISO(dateStr);
          const key = format(d, 'yyyy-MM-dd');
          if (!isAfter(d, today)) {
            sums[key] = (sums[key] || 0) + (r.current_page || 0);
          }
        }
      });
    }

    const values = [];
    dates.forEach((d, i) => {
      if (isAfter(d, today)) {
        values.push(null);
      } else {
        if (period === 'year') {
          values.push(sums[i] || 0);
        } else {
          const key = format(d, 'yyyy-MM-dd');
          values.push(sums[key] || 0);
        }
      }
    });

    const valid = values.filter(v => v !== null);
    const avg = valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;

    setMedia(avg);
    const shadow = new Array(valid.length).fill(avg);

    setChartData({
      labels,
      datasets: [
        {
          data: values,
          color: opacity => `rgba(52,120,246,${opacity})`,
          strokeWidth: 2
        },
        {
          data: shadow,
          color: () => '#bbb',
          strokeWidth: 1,
          strokeDashArray: [4, 6],
          withDots: false
        }
      ]
    });

    setChartTitle(chartLabel);
  }, [progressData, period]);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <TopBar title="Estadísticas" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ padding: 16 }}>
          {/* Panel superior en recuadro */}
          <View style={{ backgroundColor: '#f5f5f5', borderRadius: 12, paddingVertical: 12, marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{booksFinished}</Text>
                <Text style={{ fontSize: 12, color: '#555' }}>Libros</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{formatNumber(pagesRead)}</Text>
                <Text style={{ fontSize: 12, color: '#555' }}>Páginas</Text>
              </View>
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{rachaActual}</Text>
                <Text style={{ fontSize: 12, color: '#555' }}>Racha</Text>
              </View>
            </View>
          </View>

          {/* Separador sutil */}
          <View style={{ height: 1, backgroundColor: '#eee', marginBottom: 16 }} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
            {periodOptions.map(option => (
              <TouchableOpacity
                key={option.key}
                onPress={() => setPeriod(option.key)}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 6,
                  backgroundColor: period === option.key ? '#3478f6' : '#eee'
                }}
              >
                <Text style={{ color: period === option.key ? '#fff' : '#333' }}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ textAlign: 'center', fontWeight: '600', fontSize: 15 }}>{chartTitle}</Text>
          {media !== null && (
            <Text style={{ textAlign: 'center', fontSize: 13, color: '#555', marginBottom: 8 }}>
              Media: {media.toFixed(1)} páginas
            </Text>
          )}

          <LineChart
            data={chartData}
            width={chartWidth}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: opacity => `rgba(0,0,0,${opacity})`,
              labelColor: opacity => `rgba(0,0,0,${opacity})`,
              fillShadowGradient: '#3478f6',
              fillShadowGradientOpacity: 0.2,
              propsForBackgroundLines: {
                stroke: 'transparent'
              }
            }}
            style={{ borderRadius: 8, marginVertical: 12 }}
            bezier
            withDots={false}
            withShadow
            withInnerLines={false}
            withOuterLines={false}
          />

          {/* Separador sutil */}
          <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 24 }} />

          <Text style={{ fontSize: 15, fontWeight: '600', textAlign: 'center', marginBottom: 12 }}>Calendario de lectura</Text>
          <Calendar
            markedDates={diasLeidos}
            theme={{
              selectedDayBackgroundColor: '#34c759',
              selectedDayTextColor: '#fff',
              todayTextColor: '#3478f6'
            }}
            style={{ marginBottom: 16 }}
          />

          <Text style={{ textAlign: 'center', fontSize: 13, color: '#555' }}>
            Mejor racha histórica: {mejorRacha} días seguidos
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({});
