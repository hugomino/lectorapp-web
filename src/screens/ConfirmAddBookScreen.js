// src/screens/ConfirmAddBookScreen.js
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import TopBar from '../components/TopBar';
import BottomSpacer from '../components/BottomSpacer';

export default function ConfirmAddBookScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { title, author, isbn, pages, synopsis, cover_url, fromAddReading } = route.params;

  const handleConfirm = async () => {
    const { error } = await supabase.from('books').insert([
      {
        title,
        author,
        isbn,
        pages: parseInt(pages, 10),
        synopsis: synopsis || null,
        cover_url: cover_url || null,
        confirmed: false
      }
    ]);

    if (error) {
      console.error('Error al insertar el libro:', error.message);
      Alert.alert('Error', 'No se pudo guardar el libro en la base de datos.');
      return;
    }

    Alert.alert(
      '¡Gracias!',
      'Tu aportación ha sido enviada y será revisada por un desarrollador.',
      [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('MainTabs', { screen: 'Home' });
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TopBar title="Confirmar libro" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        {cover_url ? (
          <Image source={{ uri: cover_url }} style={styles.cover} resizeMode="contain" />
        ) : (
          <View style={styles.coverPlaceholder} />
        )}

        <Text style={styles.title}>{title || 'Título desconocido'}</Text>
        <Text style={styles.detail}>Autor/a: {author}</Text>
        <Text style={styles.detail}>ISBN: {isbn}</Text>
        <Text style={styles.detail}>Páginas: {pages}</Text>

        {synopsis ? (
          <>
            <Text style={[styles.detail, { marginTop: 20 }]}>Sinopsis:</Text>
            <Text style={styles.synopsis}>{synopsis}</Text>
          </>
        ) : null}

        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
          <Text style={styles.confirmBtnText}>Confirmar</Text>
        </TouchableOpacity>

        <View style={{ height: 80 }} />
      </ScrollView>

      <BottomSpacer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: {
    padding: 20,
    alignItems: 'center'
  },
  cover: {
    width: 140,
    height: 210,
    borderRadius: 8,
    marginBottom: 20
  },
  coverPlaceholder: {
    width: 140,
    height: 210,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginBottom: 20
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10
  },
  detail: {
    fontSize: 15,
    color: '#444',
    marginBottom: 4
  },
  synopsis: {
    fontSize: 14,
    color: '#555',
    marginTop: 8,
    textAlign: 'justify'
  },
  confirmBtn: {
    backgroundColor: '#3478f6',
    marginTop: 30,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 6
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  }
});
