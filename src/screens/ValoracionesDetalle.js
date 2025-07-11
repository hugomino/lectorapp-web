// src/screens/ValoracionesDetalle.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import TopBar from '../components/TopBar';
import { supabase } from '../services/supabase';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ValoracionesDetalle() {
  const route = useRoute();
  const navigation = useNavigation();
  const { book_id } = route.params;
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [weightedAverage, setWeightedAverage] = useState(null);
  const [ratingCount, setRatingCount] = useState(0);
  const [bookTitle, setBookTitle] = useState('');

  const categoryLabels = {
    recommend: '¿Lo recomendarías?',
    readability: 'Facilidad de lectura',
    characters: 'Personajes',
    pacing: 'Ritmo',
    ending: 'Final',
    worldbuilding: 'Ambientación / Mundo',
    impact: 'Impacto personal'
  };

  const getColor = (value) => {
    if (value >= 8) return '#4CAF50'; // verde
    if (value >= 6) return '#f1c40f'; // amarillo
    return '#e74c3c'; // rojo
  };

  const getGlobalBoxStyle = (value) => {
    if (value >= 8) {
      return { borderColor: '#4CAF50', backgroundColor: '#f1fef3' };
    } else if (value >= 6) {
      return { borderColor: '#f1c40f', backgroundColor: '#fffbea' };
    } else {
      return { borderColor: '#e74c3c', backgroundColor: '#fff5f5' };
    }
  };

  useEffect(() => {
    if (!book_id) {
      console.error('No se recibió un book_id válido');
      setLoading(false);
      return;
    }

    const fetchRatings = async () => {
      const { data: ratings, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('book_id', book_id);

      if (error) {
        console.error('Error fetching ratings:', error);
        setLoading(false);
        return;
      }

      if (!ratings || ratings.length === 0) {
        setCategories([]);
        setRatingCount(0);
        setWeightedAverage(null);
        setLoading(false);
        return;
      }

      setRatingCount(ratings.length);

      const weightedValues = ratings
        .map(r => r.weighted_rating)
        .filter(v => typeof v === 'number' && !isNaN(v));

      const weightedAvg =
        weightedValues.length > 0
          ? weightedValues.reduce((a, b) => a + b, 0) / weightedValues.length
          : null;

      setWeightedAverage(weightedAvg);

      const excluded = ['id', 'user_id', 'book_id', 'created_at', 'weighted_rating', 'rating'];
      const keys = Object.keys(ratings[0]).filter(k => !excluded.includes(k));

      const categoryRatings = keys.map(key => {
        const values = ratings.map(r => r[key]).filter(v => typeof v === 'number');
        const avg =
          values.length > 0
            ? values.reduce((a, b) => a + b, 0) / values.length
            : null;
        return { key, avg };
      });

      setCategories(categoryRatings);
      setLoading(false);
    };

    const fetchBookTitle = async () => {
      const { data, error } = await supabase
        .from('books')
        .select('title')
        .eq('id', book_id)
        .single();

      if (!error && data) {
        setBookTitle(data.title);
      }
    };

    fetchRatings();
    fetchBookTitle();
  }, [book_id]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#3478f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar title={bookTitle} onBack={() => navigation.goBack()} centerTitle />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Resumen de valoraciones</Text>

        {ratingCount === 0 ? (
          <Text style={styles.empty}>Este libro aún no tiene valoraciones.</Text>
        ) : (
          <>
            <View style={[styles.globalBoxCentered, getGlobalBoxStyle(weightedAverage)]}>
              <View style={styles.globalRow}>
                <Ionicons name="star" size={36} color={getColor(weightedAverage)} style={{ marginRight: 8 }} />
                <Text style={[styles.globalRating, { color: getColor(weightedAverage) }]}>
                  {weightedAverage !== null ? weightedAverage.toFixed(2) : '-'}
                </Text>
              </View>
              <Text style={styles.globalLabel}>Valoración global ({ratingCount})</Text>
            </View>

            <Text style={styles.subHeader}>Por categorías</Text>

            {Object.keys(categoryLabels).map(key => {
              const match = categories.find(c => c.key === key);
              const avg = match ? match.avg : null;

              let color = '#ccc';
              if (avg !== null) {
                if (avg >= 8) color = '#4CAF50';
                else if (avg >= 6) color = '#f1c40f';
                else color = '#e74c3c';
              }

              return (
                <View key={key} style={[styles.card, { borderLeftColor: color }]}>
                  <Text style={styles.catLabel}>{categoryLabels[key]}</Text>
                  <Text style={[styles.catRating, { color }]}>
                    {avg !== null ? avg.toFixed(2) : '-'}
                  </Text>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  content: { padding: 20 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#222',
    marginBottom: 20
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginBottom: 12,
    marginTop: 16
  },
  globalBoxCentered: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 20
  },
  globalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  globalRating: {
    fontSize: 30,
    fontWeight: 'bold'
  },
  globalLabel: {
    fontSize: 14,
    color: '#555'
  },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderColor: '#eee',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  },
  catLabel: {
    fontSize: 15,
    color: '#333',
    flex: 1
  },
  catRating: {
    fontSize: 16,
    fontWeight: '600'
  },
  empty: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 40
  }
});
