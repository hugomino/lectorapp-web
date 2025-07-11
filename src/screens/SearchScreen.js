// src/screens/SearchScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Animated,
  Image,
  Dimensions,
  StyleSheet,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TopBar from '../components/TopBar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TABS = ['Libros', 'Autores'];

export default function SearchScreen() {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const scrollRef = useRef(null);
  const underlineX = useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState(0);

  const handleTabPress = index => {
    setActiveTab(index);
    scrollRef.current.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    Animated.spring(underlineX, {
      toValue: index * (SCREEN_WIDTH / TABS.length),
      useNativeDriver: true
    }).start();
  };

  useEffect(() => {
    const term = query.trim();
    if (!term) {
      setBooks([]);
      setAuthors([]);
      return;
    }

    const fetch = async () => {
      if (activeTab === 0) {
        const { data, error } = await supabase
          .from('books')
          .select('id, title, author, confirmed, cover_url')
          .or(`title.ilike.%${term}%,isbn.ilike.%${term}%`)
          .limit(20);
        if (!error) setBooks(data || []);
        else console.error('Error buscando libros:', error.message);
      } else {
        const { data, error } = await supabase
          .from('books')
          .select('author')
          .ilike('author', `%${term}%`)
          .limit(100);
        if (!error) {
          const unique = [...new Set(data.map(b => b.author))];
          setAuthors(unique);
        } else {
          console.error('Error buscando autores:', error.message);
        }
      }
    };

    fetch();
  }, [query, activeTab]);

  const goToAddBook = () => navigation.navigate('AddBook');

  const renderBook = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('FichaLibro', { book_id: item.id })}
    >
      <View style={styles.bookRow}>
        {item.cover_url ? (
          <Image source={{ uri: item.cover_url }} style={styles.cover} />
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

  const renderAuthor = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('FichaAutor', { author: item })}
    >
      <Text style={styles.title}>{item}</Text>
    </TouchableOpacity>
  );

  const renderEmptyBooks = () => (
    <TouchableOpacity style={styles.item} onPress={goToAddBook}>
      <View style={styles.bookRow}>
        <View style={styles.coverPlaceholder} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Añadir libro a la base de datos</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyAuthors = () =>
    query.trim() !== '' ? <Text style={styles.empty}>Sin resultados.</Text> : null;

  const handleScroll = e => {
    const offsetX = e.nativeEvent.contentOffset.x;
    underlineX.setValue(offsetX / SCREEN_WIDTH * (SCREEN_WIDTH / TABS.length));
  };

  const handleMomentumEnd = e => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setActiveTab(index);
  };

  return (
    <View style={styles.container}>
      <TopBar
        title="Buscar"
        onBack={null}
        rightIcon={
          <TouchableOpacity onPress={goToAddBook}>
            <Ionicons name="add" size={24} color="#000" />
          </TouchableOpacity>
        }
      />

      <View style={styles.searchWrapper}>
        <TextInput
          placeholder="Buscar..."
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.tabs}>
        {TABS.map((tab, index) => (
          <TouchableOpacity
            key={tab}
            style={styles.tab}
            onPress={() => handleTabPress(index)}
          >
            <Text style={[styles.tabText, activeTab === index && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
        <Animated.View
          style={[
            styles.underline,
            {
              width: SCREEN_WIDTH / TABS.length,
              transform: [{ translateX: underlineX }]
            }
          ]}
        />
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        ref={scrollRef}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        decelerationRate="fast"
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumEnd}
      >
        <FlatList
          data={books}
          keyExtractor={item => item.id.toString()}
          renderItem={renderBook}
          contentContainerStyle={styles.list}
          ListEmptyComponent={query ? renderEmptyBooks : null}
          style={{ width: SCREEN_WIDTH }}
        />
        <FlatList
          data={authors}
          keyExtractor={(item, i) => i.toString()}
          renderItem={renderAuthor}
          contentContainerStyle={styles.list}
          ListEmptyComponent={renderEmptyAuthors}
          style={{ width: SCREEN_WIDTH }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 10
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 40
  },
  tabs: {
    flexDirection: 'row',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginTop: 10
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12
  },
  tabText: {
    fontSize: 14,
    color: '#777'
  },
  tabTextActive: {
    fontWeight: 'bold',
    color: '#000'
  },
  underline: {
    position: 'absolute',
    height: 3,
    bottom: 0,
    backgroundColor: '#3478f6',
    borderRadius: 2
  },
  list: {
    padding: 16
  },
  item: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee'
  },
  bookRow: {
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
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    marginTop: 32
  }
});
