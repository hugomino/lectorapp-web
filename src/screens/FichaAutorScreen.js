// src/screens/FichaAutor.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TopBar from '../components/TopBar';
import { supabase } from '../services/supabase';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function FichaAutor({ route }) {
  const { author } = route.params;
  const navigation = useNavigation();
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('id, title, cover_url, confirmed')
        .eq('author', author);

      if (booksError || !booksData) return;

      const bookIds = booksData.map(b => b.id);

      const { data: readersData, error: readersError } = await supabase
        .from('reading_progress')
        .select('book_id, user_id');

      if (readersError || !readersData) return;

      const readCounts = {};
      readersData.forEach(r => {
        readCounts[r.book_id] = (readCounts[r.book_id] || 0) + 1;
      });

      const enrichedBooks = booksData.map(b => ({
        ...b,
        readers: readCounts[b.id] || 0
      }));

      enrichedBooks.sort((a, b) => b.readers - a.readers);

      setBooks(enrichedBooks);
    };

    fetchBooks();
  }, [author]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('FichaLibro', { book_id: item.id })}
    >
      <View style={styles.coverWrapper}>
        {item.cover_url ? (
          <Image source={{ uri: item.cover_url }} style={styles.cover} />
        ) : (
          <View style={styles.coverPlaceholder} />
        )}
        {item.confirmed && (
          <Ionicons
            name="checkmark-circle"
            size={20}
            color="#3498db"
            style={styles.checkIcon}
          />
        )}
      </View>
      <Text numberOfLines={2} style={styles.title}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TopBar title={author} onBack={() => navigation.goBack()} centerTitle />
      <FlatList
        data={books}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        numColumns={3}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Este autor aún no tiene libros.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  list: {
    paddingHorizontal: 12,
    paddingVertical: 20
  },
  item: {
    width: '30%',
    marginHorizontal: '1.66%',
    marginBottom: 24,
    alignItems: 'center'
  },
  coverWrapper: {
    position: 'relative'
  },
  cover: {
    width: 100,
    height: 150,
    borderRadius: 4,
    backgroundColor: '#eee'
  },
  coverPlaceholder: {
    width: 100,
    height: 150,
    borderRadius: 4,
    backgroundColor: '#eee'
  },
  checkIcon: {
    position: 'absolute',
    top: 4,
    right: 4
  },
  title: {
    marginTop: 6,
    fontSize: 13,
    textAlign: 'center',
    color: '#333'
  },
  empty: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
    marginTop: 40
  }
});
