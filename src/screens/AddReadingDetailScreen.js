// src/screens/AddReadingDetailScreen.js
import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import TopBar from '../components/TopBar';
import { supabase } from '../services/supabase';
import { UserContext } from '../context/UserContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function AddReadingDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { book_id } = route.params || {};
  const { user } = useContext(UserContext);

  const [book, setBook] = useState(null);
  const [rating, setRating] = useState(null);
  const [ratingCount, setRatingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      const { data, error } = await supabase
        .from('books')
        .select('id, title, author, cover_url, confirmed')
        .eq('id', book_id)
        .single();

      if (!error) {
        setBook(data);

        // Obtener valoraciones desde ratings
        const { data: ratingsData, error: ratingsError } = await supabase
          .from('ratings')
          .select('weighted_rating')
          .eq('book_id', book_id);

        if (!ratingsError && ratingsData.length > 0) {
          const sum = ratingsData.reduce((acc, r) => acc + (r.weighted_rating || 0), 0);
          const avg = sum / ratingsData.length;
          setRating(avg);
          setRatingCount(ratingsData.length);
        }
      }

      setLoading(false);
    };

    if (book_id) fetchBook();
  }, [book_id]);

  const goBackToSearch = () => {
    navigation.navigate('AddReading');
  };

  const startReading = async () => {
    const { error } = await supabase
      .from('reading_progress')
      .insert({
        user_id: user.id,
        book_id: book.id,
        current_page: 0
      });

    if (error) {
      console.error('Error starting reading', error);
    } else {
      navigation.navigate('MainTabs', { screen: 'Home' });
    }
  };

  const ratingText =
    rating != null && typeof rating === 'number'
      ? `${rating.toFixed(2)} (${ratingCount})`
      : '-';

  if (loading) {
    return (
      <View style={styles.container}>
        <TopBar title="Detalles" onBack={goBackToSearch} />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#3478f6" />
        </View>
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.container}>
        <TopBar title="Detalles" onBack={goBackToSearch} />
        <View style={styles.loadingContent}>
          <Text>No se pudo cargar el libro.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar title="Detalles" onBack={goBackToSearch} />

      <View style={styles.content}>
        {book.cover_url ? (
          <Image source={{ uri: book.cover_url }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.coverPlaceholder]} />
        )}

        <Text style={styles.title}>{book.title || 'Título desconocido'}</Text>
        <Text style={styles.author}>{book.author || 'Autor desconocido'}</Text>

        <View style={styles.ratingRow}>
          <Ionicons
            name="checkmark-circle"
            size={16}
            color={book.confirmed ? '#3498db' : '#ccc'}
            style={{ marginRight: 4 }}
          />
          <Ionicons name="star" size={16} color="#f1c40f" style={{ marginRight: 4 }} />
          <Text style={styles.rating}>{ratingText}</Text>
        </View>

        <Text style={styles.prompt}>
          ¿Vas a comenzar la lectura de este libro?
        </Text>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.btn, styles.btnNo]}
            onPress={goBackToSearch}
          >
            <Text style={styles.btnText}>No</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnYes]}
            onPress={startReading}
          >
            <Text style={[styles.btnText, styles.btnYesText]}>Sí</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    padding: 16,
    alignItems: 'center'
  },
  cover: {
    width: 140,
    height: 210,
    borderRadius: 6,
    marginBottom: 16,
    backgroundColor: '#eee'
  },
  coverPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4
  },
  author: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 8
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  rating: {
    fontSize: 13,
    color: '#777'
  },
  prompt: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24
  },
  buttons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around'
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 8
  },
  btnNo: {
    backgroundColor: '#eee'
  },
  btnYes: {
    backgroundColor: '#3478f6'
  },
  btnText: {
    fontSize: 16
  },
  btnYesText: {
    color: '#fff',
    fontWeight: '600'
  }
});
