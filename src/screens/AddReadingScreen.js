import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import TopBar from '../components/TopBar';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function AddReadingScreen() {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    const term = query.trim();
    if (!term) {
      setResults([]);
      return;
    }

    const fetch = async () => {
      const { data, error } = await supabase
        .from('books')
        .select('id, title, author, cover_url, confirmed')
        .or(`title.ilike.%${term}%,isbn.ilike.%${term}%`)
        .limit(20);

      if (!error && data) {
        const withCovers = data.map(book => ({
          ...book,
          imageUrl: book.cover_url || null
        }));
        setResults(withCovers);
      } else {
        console.error('Error buscando libros:', error);
      }
    };

    fetch();
  }, [query]);

  const handleSelect = book_id => {
    navigation.navigate('AddReadingDetail', { book_id });
  };

  const goToAddBook = () => {
    navigation.navigate('AddBook'); // igual que en SearchScreen
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item.id)}>
      <View style={styles.resultRow}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.cover} resizeMode="contain" />
        ) : (
          <View style={styles.coverPlaceholder} />
        )}
        <View style={{ flex: 1 }}>
          <View style={styles.row}>
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={item.confirmed ? '#3498db' : '#ccc'}
              style={{ marginRight: 6, marginTop: 2 }}
            />
            <Text numberOfLines={2} style={styles.title}>{item.title}</Text>
          </View>
          <Text numberOfLines={1} style={styles.author}>{item.author}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <TouchableOpacity style={styles.resultItem} onPress={goToAddBook}>
      <View style={styles.resultRow}>
        <View style={styles.coverPlaceholder} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Añadir libro a la base de datos</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TopBar
        title="Añadir lectura"
        onBack={() => navigation.goBack()}
        rightIcon={
          <TouchableOpacity onPress={goToAddBook}>
            <Ionicons name="add" size={24} color="#000" />
          </TouchableOpacity>
        }
      />

      <View style={styles.searchWrapper}>
        <TextInput
          placeholder="Buscar libro por título o ISBN..."
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={query ? renderEmpty : null}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 12
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 40
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 12
  },
  resultItem: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee'
  },
  resultRow: {
    flexDirection: 'row',
    gap: 12
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
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    lineHeight: 20,
    flex: 1
  },
  author: {
    fontSize: 13,
    color: '#666',
    marginTop: 2
  }
});
