// src/screens/StatisticsScreen.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import {
  format,
  parseISO,
  isAfter,
  isSameDay,
  getDate,
  startOfWeek,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth
} from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { supabase } from '../services/supabase';
import { UserContext } from '../context/UserContext';
import TopBar from '../components/TopBar';
import Ionicons from 'react-native-vector-icons/Ionicons';

LocaleConfig.locales['es'] = {
  monthNames: [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ],
  monthNamesShort: [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ],
  dayNames: [
    'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
  ],
  dayNamesShort: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 32;

function formatNumber(n) {
  return n >= 10000 ? (n / 1000).toFixed(1) + 'k' : n.toString();
}

export default function StatisticsScreen() {
  const { user } = useContext(UserContext);

  const [logs, setLogs] = useState([]);
  const [pagesRead, setPagesRead] = useState(0);
  const [booksFinished, setBooksFinished] = useState(0);
  const [period, setPeriod] = useState('week');
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [chartTitle, setChartTitle] = useState('');
  const [media, setMedia] = useState(null);
  const [diasLeidos, setDiasLeidos] = useState({});
  const [rachaActual, setRachaActual] = useState(0);
  const [mejorRacha, setMejorRacha] = useState(0);
  const [offset, setOffset] = useState(0);

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('reading_logs')
      .select('created_at, pages_read')
      .eq('user_id', user.id);

    if (!error) {
      setLogs(data || []);

      const total = data.reduce((sum, r) => sum + (r.pages_read || 0), 0);
      setPagesRead(total);

      const fechas = {};
      const hoy = new Date();

      const fechasUnicas = [...new Set(data.map(e => format(parseISO(e.created_at), 'yyyy-MM-dd')))]
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

      let rachaHoy = 0;
      for (let i = 0; i < fechasUnicas.length; i++) {
        const fecha = fechasUnicas[fechasUnicas.length - 1 - i];
        const esperada = subDays(hoy, i);
        if (isSameDay(fecha, esperada)) rachaHoy++;
        else break;
      }

      let actual = 1;
      let mejor = 1;
      for (let i = 1; i < fechasUnicas.length; i++) {
        const anterior = fechasUnicas[i - 1];
        const actualFecha = fechasUnicas[i];
        const diferencia = (actualFecha - anterior) / (1000 * 60 * 60 * 24);
        if (diferencia === 1) {
          actual++;
          mejor = Math.max(mejor, actual);
        } else {
          actual = 1;
        }
      }

      setDiasLeidos(fechas);
      setRachaActual(rachaHoy);
      setMejorRacha(mejor);
    }
  };

  const fetchBooksFinished = async () => {
    const { data, error } = await supabase
      .from('reading_progress')
      .select('finished, current_page, total_pages')
      .eq('user_id', user.id);

    if (!error) {
      const count = data.filter(r => r.finished || r.current_page >= r.total_pages).length;
      setBooksFinished(count);
    }
  };

  const periodOptions = [
    { key: 'week', label: 'Semana' },
    { key: 'month', label: 'Mes' }
  ];

  useFocusEffect(
    useCallback(() => {
      fetchLogs();
      fetchBooksFinished();
    }, [user.id])
  );

  useEffect(() => {
    const today = new Date();
    let baseDate = new Date();
    if (period === 'week') baseDate = subDays(today, 7 * offset);
    if (period === 'month') {
      const temp = new Date(today.getFullYear(), today.getMonth(), 1);
      temp.setMonth(temp.getMonth() - offset);
      baseDate = temp;
    }

    let dates = [];
    let labels = [];
    let chartLabel = '';

    if (period === 'week') {
      const base = startOfWeek(baseDate, { weekStartsOn: 1 });
      for (let i = 0; i < 7; i++) {
        const date = addDays(base, i);
        dates.push(date);
        labels.push(['L', 'M', 'X', 'J', 'V', 'S', 'D'][i]);
      }
      chartLabel = `Semana del ${format(dates[0], 'dd/MM')} al ${format(dates[6], 'dd/MM')}`;
    } else if (period === 'month') {
      const startMonth = startOfMonth(baseDate);
      const endMonth = endOfMonth(baseDate);
      for (let d = new Date(startMonth); !isAfter(d, endMonth); d.setDate(d.getDate() + 1)) {
        const date = new Date(d);
        dates.push(date);
        const dia = getDate(date);
        labels.push([1, 5, 10, 15, 20, 25, 30].includes(dia) ? String(dia) : '');
      }
      chartLabel = 'Mes de ' + format(baseDate, 'LLLL', { locale: es }).replace(/^./, c => c.toUpperCase());
    }

    const values = dates.map(d => {
      const totalPages = logs
        .filter(r => isSameDay(parseISO(r.created_at), d))
        .reduce((sum, r) => sum + (r.pages_read || 0), 0);
      return totalPages;
    });

    const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    const shadow = new Array(values.length).fill(avg);

    setMedia(avg);
    setChartTitle(chartLabel);
    setChartData({
      labels,
      datasets: [
        { data: values, color: o => `rgba(52,120,246,${o})`, strokeWidth: 2 },
        { data: shadow, color: () => '#bbb', strokeWidth: 1, strokeDashArray: [4, 6] }
      ]
    });
  }, [logs, period, offset]);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <TopBar title="Estadísticas" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ padding: 16 }}>
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

          <View style={{ height: 1, backgroundColor: '#eee', marginBottom: 16 }} />

          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
            {periodOptions.map(option => (
              <TouchableOpacity
                key={option.key}
                onPress={() => {
                  setOffset(0);
                  setPeriod(option.key);
                }}
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

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20, marginBottom: 4 }}>
            <TouchableOpacity onPress={() => setOffset(offset + 1)}>
              <Ionicons name="chevron-back" size={20} color="#3478f6" />
            </TouchableOpacity>
            <Text style={{ textAlign: 'center', fontWeight: '600', fontSize: 15 }}>{chartTitle}</Text>
            <TouchableOpacity onPress={() => setOffset(Math.max(0, offset - 1))}>
              <Ionicons name="chevron-forward" size={20} color="#3478f6" />
            </TouchableOpacity>
          </View>

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
            style={{ borderRadius: 8, marginVertical: 12, alignSelf: 'center' }}
            bezier
            withDots={false}
            withShadow
            withInnerLines={false}
            withOuterLines={false}
          />

          <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 24 }} />

          <Text style={{ fontSize: 15, fontWeight: '600', textAlign: 'center', marginBottom: 12 }}>Calendario de lectura</Text>
          <Calendar
            markedDates={diasLeidos}
            theme={{
              selectedDayBackgroundColor: '#34c759',
              selectedDayTextColor: '#fff',
              todayTextColor: '#3478f6'
            }}
            firstDay={1}
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
