// src/screens/EliminarLibroTerminado.js
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

export default function EliminarLibroTerminado() {
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
        .eq('finished', true);

      if (!error && data) {
        setBooks(data.map(b => b.books));
      }
    };

    fetchBooks();
  }, [user.id]);

  const handleDelete = bookId => {
    Alert.alert(
      '¿Eliminar libro?',
      'Este libro será eliminado de tu historial de lecturas y tu valoración también se borrará.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, estoy seguro',
          style: 'destructive',
          onPress: async () => {
            const idNum = Number(bookId);

            const { error: logsError } = await supabase
              .from('reading_logs')
              .delete()
              .eq('user_id', user.id)
              .eq('book_id', idNum);

            const { error: progressError } = await supabase
              .from('reading_progress')
              .delete()
              .eq('user_id', user.id)
              .eq('book_id', idNum);

            const { error: ratingError } = await supabase
              .from('ratings')
              .delete()
              .eq('user_id', user.id)
              .eq('book_id', idNum);

            if (logsError || progressError || ratingError) {
              console.error('Error al eliminar:', logsError || progressError || ratingError);
              Alert.alert('Error', 'No se pudo eliminar correctamente.');
              return;
            }

            navigation.navigate('MainTabs', { screen: 'HomeScreen' });
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => handleDelete(item.id)}>
      {item.cover_url ? (
        <Image source={{ uri: item.cover_url }} style={styles.cover} resizeMode="cover" />
      ) : (
        <View style={styles.coverPlaceholder} />
      )}
      <View style={{ flex: 1 }}>
        <Text numberOfLines={2} style={styles.title}>{item.title || 'Título desconocido'}</Text>
        <Text numberOfLines={1} style={styles.author}>{item.author || 'Autor desconocido'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TopBar title="Eliminar libro terminado" onBack={() => navigation.goBack()} />
      <FlatList
        data={books}
        keyExtractor={item => item.id?.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No hay libros terminados.</Text>}
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
    backgroundColor: '#eee'
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
