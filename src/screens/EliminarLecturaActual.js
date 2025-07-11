// src/screens/EliminarLecturaActual.js
import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TopBar from '../components/TopBar';
import { supabase } from '../services/supabase';
import { UserContext } from '../context/UserContext';

export default function EliminarLecturaActual() {
  const navigation = useNavigation();
  const { user } = useContext(UserContext);
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      const { data, error } = await supabase
        .from('reading_progress')
        .select(`
          book_id,
          books (
            id,
            title,
            author,
            cover_url
          )
        `)
        .eq('user_id', user.id)
        .eq('finished', false);

      if (!error && data) {
        setBooks(data.map(r => ({
          ...r.books,
          book_id: r.book_id
        })));
      }
    };

    fetchBooks();
  }, [user.id]);

  const handleDelete = bookId => {
    Alert.alert(
      '¿Dejar de leer este libro?',
      'Esta lectura se eliminará y las páginas leídas no se contabilizarán.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, estoy seguro',
          style: 'destructive',
          onPress: async () => {
            const idNum = Number(bookId);
            console.log('Intentando borrar lectura con:', { user_id: user.id, book_id: idNum });

            const { error: logError } = await supabase
              .from('reading_logs')
              .delete()
              .eq('user_id', user.id)
              .eq('book_id', idNum);

            const { error: progressError } = await supabase
              .from('reading_progress')
              .delete()
              .eq('user_id', user.id)
              .eq('book_id', idNum);

            if (logError) console.error('Error al eliminar de reading_logs:', logError);
            if (progressError) console.error('Error al eliminar de reading_progress:', progressError);

            if (!logError && !progressError) {
              setBooks(prev => prev.filter(b => Number(b.book_id) !== idNum));

              // Navega a la pantalla principal y fuerza enfoque de HomeScreen
              navigation.navigate('MainTabs', { screen: 'HomeScreen' });
            } else {
              Alert.alert('Error', 'No se pudo eliminar la lectura.');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => handleDelete(item.book_id)}>
      {item.cover_url ? (
        <Image source={{ uri: item.cover_url }} style={styles.cover} />
      ) : (
        <View style={styles.coverPlaceholder} />
      )}
      <View style={{ flex: 1 }}>
        <Text numberOfLines={2} style={styles.title}>{item.title}</Text>
        <Text numberOfLines={1} style={styles.author}>{item.author}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TopBar title="Eliminar lectura actual" onBack={() => navigation.goBack()} />
      <FlatList
        data={books}
        keyExtractor={item => item.book_id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No tienes lecturas actuales.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  list: { padding: 16 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee'
  },
  cover: {
    width: 48,
    height: 72,
    borderRadius: 4,
    backgroundColor: '#ddd'
  },
  coverPlaceholder: {
    width: 48,
    height: 72,
    borderRadius: 4,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000'
  },
  author: {
    fontSize: 13,
    color: '#666',
    marginTop: 2
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
    color: '#999'
  }
});
