// src/screens/LecturasTerminadas.js
import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { supabase } from '../services/supabase';
import { UserContext } from '../context/UserContext';
import TopBar from '../components/TopBar';

export default function LecturasTerminadas({ navigation }) {
  const { user } = useContext(UserContext);
  const [finishedBooks, setFinishedBooks] = useState([]);

  const fetchBooks = async () => {
    const { data, error } = await supabase
      .from('reading_logs')
      .select('book_id, created_at, books (title, cover_url)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setFinishedBooks(data);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const goToBook = (book_id) => {
    navigation.navigate('FichaLibro', { book_id });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => goToBook(item.book_id)}
    >
      <Image
        source={{ uri: item.books?.cover_url }}
        style={styles.cover}
        resizeMode="cover"
      />
      <Text style={styles.title} numberOfLines={2}>
        {item.books?.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TopBar title="Lecturas terminadas" onBack={() => navigation.goBack()} />

      <FlatList
        data={finishedBooks}
        keyExtractor={(item, index) => `${item.book_id}-${index}`}
        numColumns={3}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa'
  },
  list: {
    padding: 16
  },
  item: {
    flex: 1 / 3,
    margin: 6,
    alignItems: 'center'
  },
  cover: {
    width: 100,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#eee'
  },
  title: {
    fontSize: 13,
    color: '#333',
    marginTop: 6,
    textAlign: 'center'
  }
});
