// src/screens/HomeScreen.js
import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Text,
  ScrollView,
  Image
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import TopBar from '../components/TopBar';
import ReadingBookCard from '../components/ReadingBookCard';
import StatsSummary from '../components/StatsSummary';
import { supabase } from '../services/supabase';
import { UserContext } from '../context/UserContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { parseISO, isSameDay, subDays } from 'date-fns';
import TutorialOverlay from '../components/TutorialOverlay';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CONTENT_MARGIN = 16;
const CARD_WIDTH = SCREEN_WIDTH;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.72;

function formatNumber(n) {
  return n >= 10000 ? (n / 1000).toFixed(1) + 'k' : n.toString();
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useContext(UserContext);

  const [inProgress, setInProgress] = useState([]);
  const [stats, setStats] = useState({ booksFinished: 0, pagesRead: 0, streak: 0 });
  const [lastFinished, setLastFinished] = useState([]);

  // Tutorial
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [highlightData, setHighlightData] = useState(null);

  const refAdd = useRef();
  const refCarrusel = useRef();
  const refStats = useRef();
  const refTerminados = useRef();

  const tutorialSteps = [
    { ref: refAdd, message: 'Pulsa aquí para añadir un nuevo libro que estés leyendo.' },
    { ref: refCarrusel, message: 'Tus lecturas en curso se mostrarán aquí, en forma de carrusel. Podrás actualizar la página o marcar el libro como terminado.' },
    { ref: refStats, message: 'Consulta tus estadísticas lectoras: libros terminados, páginas leídas y tu racha actual.' },
    { ref: refTerminados, message: 'Aquí verás tus últimas lecturas terminadas. Pulsa para acceder y verlas todas.' }
  ];

  const nextTutorialStep = () => {
    const next = tutorialStep + 1;
    if (next >= tutorialSteps.length) {
      AsyncStorage.setItem('tutorialCompleted', 'true');
      setShowTutorial(false);
      return;
    }
    setTutorialStep(next);
    setTimeout(() => measureHighlight(tutorialSteps[next].ref, tutorialSteps[next].message), 200);
  };

  const measureHighlight = (ref, message) => {
    if (!ref.current) return;
    ref.current.measure((x, y, width, height, pageX, pageY) => {
      setHighlightData({ x: pageX, y: pageY, width, height, message });
    });
  };

  const checkTutorial = async () => {
    const done = await AsyncStorage.getItem('tutorialCompleted');
    if (!done) {
      setShowTutorial(true);
      setTimeout(() => measureHighlight(tutorialSteps[0].ref, tutorialSteps[0].message), 300);
    }
  };

  const fetchInProgress = async () => {
    const { data, error } = await supabase
      .from('reading_progress')
      .select(`
        book_id,
        current_page,
        total_pages,
        updated_at,
        finished,
        books (
          id,
          title,
          author,
          cover_url,
          pages,
          confirmed
        )
      `)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) return console.error('Error in reading_progress:', error);

    const books = data
      .filter(r => !r.finished)
      .map(r => ({
        id: r.book_id,
        cover: r.books.cover_url || null,
        title: r.books.title,
        author: r.books.author,
        currentPage: r.current_page,
        totalPages: r.total_pages ?? r.books.pages,
        confirmed: r.books.confirmed
      }));

    setInProgress([...books, { id: 'add' }]);
  };

  const fetchLastFinished = async () => {
    const { data, error } = await supabase
      .from('reading_progress')
      .select(`book_id, updated_at, books ( id, title, author, cover_url )`)
      .eq('user_id', user.id)
      .eq('finished', true)
      .order('updated_at', { ascending: false })
      .limit(3);

    if (error) return console.error('Error in lastFinished:', error);
    setLastFinished(data);
  };

  const fetchStats = async () => {
    const { data: logs, error: logsError } = await supabase
      .from('reading_logs')
      .select('created_at')
      .eq('user_id', user.id);

    if (logsError) return console.error('Error fetching logs:', logsError);

    const fechasUnicas = [...new Set(logs.map(e => e.created_at))].map(d => parseISO(d)).sort((a, b) => b - a);
    const hoy = new Date();
    let racha = 0;

    for (let i = 0; i < fechasUnicas.length; i++) {
      const fecha = fechasUnicas[i];
      const esperada = subDays(hoy, i);
      if (isSameDay(fecha, esperada)) {
        racha++;
      } else {
        break;
      }
    }

    const { data: progress, error: progressError } = await supabase
      .from('reading_progress')
      .select('current_page, total_pages')
      .eq('user_id', user.id);

    if (progressError) return console.error('Error in progress:', progressError);

    const pagesRead = progress.reduce((sum, r) => sum + (r.current_page || 0), 0);
    const booksFinished = progress.filter(r => r.current_page >= r.total_pages).length;

    setStats({ booksFinished, pagesRead: formatNumber(pagesRead), streak: racha });
  };

  useFocusEffect(
    useCallback(() => {
      fetchInProgress();
      fetchStats();
      fetchLastFinished();
      checkTutorial();
    }, [user.id])
  );

  const addNew = () => navigation.navigate('AddReading');
  const updatePage = book => navigation.navigate('UpdatePageModal', { bookId: book.id });
  const goToFichaLibro = id => navigation.navigate('FichaLibro', { book_id: id });
  const goToSettings = () => navigation.navigate('Ajustes');
  const goToStats = () => navigation.navigate('Statistics');
  const goToTerminated = () => navigation.navigate('LecturasTerminadas');

  const markFinished = async (book) => {
    const now = new Date().toISOString();

    const { error: progressError } = await supabase
      .from('reading_progress')
      .update({ current_page: book.totalPages, finished: true })
      .eq('user_id', user.id)
      .eq('book_id', book.id);

    if (progressError) return console.error('Error al marcar terminado:', progressError);

    const { error: logError } = await supabase
      .from('reading_logs')
      .insert({ user_id: user.id, book_id: book.id, pages_read: book.totalPages, created_at: now });

    if (logError) return console.error('Error al guardar log:', logError);

    navigation.navigate('PantallaValoracionPendiente', { bookId: book.id });
  };

  const renderItem = ({ item }) => {
    if (item.id === 'add') {
      return (
        <View style={styles.cardWrapper} ref={refAdd}>
          <TouchableOpacity style={styles.addCardManual} onPress={addNew}>
            <Text style={styles.addCardText}>Añadir nueva lectura</Text>
            <Text style={styles.addCardPlus}>+</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.cardWrapper}>
        <ReadingBookCard
          cover={item.cover}
          title={item.title}
          author={item.author}
          currentPage={item.currentPage}
          totalPages={item.totalPages}
          confirmed={item.confirmed}
          onUpdatePage={() => updatePage(item)}
          onMarkFinished={() => markFinished(item)}
          onPressCover={() => goToFichaLibro(item.id)}
        />
      </View>
    );
  };

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <TopBar
          title="Lector"
          leftIcon={<Ionicons name="warning-outline" size={22} color="#e74c3c" />}
          onBack={() => navigation.navigate('SoporteCategoria')}
          rightIcon={
            <TouchableOpacity onPress={goToSettings}>
              <Ionicons name="settings-outline" size={22} color="#000" />
            </TouchableOpacity>
          }
        />

        {inProgress.length > 0 && (
          <View ref={refCarrusel}>
            <FlatList
              data={inProgress}
              horizontal
              pagingEnabled
              decelerationRate="fast"
              snapToInterval={CARD_WIDTH}
              snapToAlignment="start"
              showsHorizontalScrollIndicator={false}
              keyExtractor={item => item.id.toString()}
              style={{ height: CARD_HEIGHT, marginTop: 15 }}
              renderItem={renderItem}
            />
          </View>
        )}

        <View ref={refStats}>
          <StatsSummary
            booksFinished={stats.booksFinished}
            pagesRead={stats.pagesRead}
            streak={stats.streak}
            onPress={goToStats}
          />
        </View>

        {lastFinished.length > 0 && (
          <View style={{ marginTop: 20, paddingHorizontal: 16 }} ref={refTerminados}>
            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Tus últimas lecturas</Text>
            <TouchableOpacity onPress={goToTerminated}>
              <View style={{ flexDirection: 'row' }}>
                {lastFinished.map(({ book_id, books }) => (
                  <Image
                    key={book_id}
                    source={{ uri: books.cover_url }}
                    style={{ width: 100, height: 150, borderRadius: 8, marginRight: 12 }}
                  />
                ))}
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <TutorialOverlay
        visible={showTutorial}
        step={highlightData}
        onNext={nextTutorialStep}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  cardWrapper: {
    width: CARD_WIDTH,
    paddingHorizontal: CONTENT_MARGIN,
    paddingBottom: 16,
    paddingTop: 2
  },
  addCardManual: {
    height: 520,
    width: '100%',
    backgroundColor: '#3478f6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 5,
    elevation: 3
  },
  addCardText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center'
  },
  addCardPlus: {
    color: '#fff',
    fontSize: 60,
    fontWeight: '400',
    marginTop: -5,
    textAlign: 'center'
  }
});
