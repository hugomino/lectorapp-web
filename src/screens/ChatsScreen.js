// src/screens/ChatsScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { UserContext } from '../context/UserContext';
import TopBar from '../components/TopBar';

// formatea “hace X min/h/d”
function timeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'Ahora';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

export default function ChatsScreen() {
  const navigation = useNavigation();
  const { user } = useContext(UserContext);

  const [query, setQuery] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [chats, setChats] = useState([]);

  // 1) Carga las conversaciones existentes del usuario
  const fetchChats = async () => {
    const { data: convos, error: convError } = await supabase
      .from('conversations')
      .select('id, user1, user2')
      .or(`user1.eq.${user.id},user2.eq.${user.id}`);

    if (convError) {
      console.error('Error fetching conversations', convError);
      return;
    }

    const items = [];
    for (const convo of convos) {
      // determina el otro participante
      const otherId = convo.user1 === user.id ? convo.user2 : convo.user1;

      // perfil del otro
      const { data: profData, error: profError } = await supabase
        .from('user_profiles')
        .select('username, avatar_url')
        .eq('id', otherId)
        .maybeSingle();
      if (!profData || profError) continue;

      // último mensaje (columna `content`)
      const { data: msgs, error: msgError } = await supabase
        .from('messages')
        .select('content, created_at')
        .eq('conversation_id', convo.id)
        .order('created_at', { ascending: false })
        .limit(1);
      if (msgError) console.error('Error fetching messages', msgError);

      const lastMsg = msgs?.[0] ?? null;
      items.push({
        id: convo.id,
        userName: profData.username,
        avatar: profData.avatar_url,
        lastMessage: lastMsg?.content || '',
        timestamp: lastMsg ? new Date(lastMsg.created_at).getTime() : 0
      });
    }

    // ordena de más reciente a más antiguo
    items.sort((a, b) => b.timestamp - a.timestamp);
    setChats(items);
  };

  // 2) Buscar perfiles al vuelo (filtrado servidor-side del propio user)
  const fetchProfiles = async () => {
    const term = query.trim();
    if (!term) {
      setProfiles([]);
      return;
    }
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, username, avatar_url')
      .ilike('username', `%${term}%`)
      .neq('id', user.id)
      .limit(10);

    if (error) {
      console.error('Error fetching profiles', error);
      setProfiles([]);
      return;
    }
    setProfiles(data);
  };

  // mount
  useEffect(() => {
    fetchChats();
  }, []);

  // cada vez que cambie `query`
  useEffect(() => {
    fetchProfiles();
  }, [query]);

  // 3) Iniciar o recuperar conversación al tocar un perfil
  const handleSelectUser = async (profile) => {
    const { data: existing, error: existError } = await supabase
      .from('conversations')
      .select('id')
      .or(
        `and(user1.eq.${user.id},user2.eq.${profile.id}),and(user1.eq.${profile.id},user2.eq.${user.id})`
      )
      .limit(1);

    if (existError) {
      console.error('Error checking conversation', existError);
      return;
    }

    let convoId;
    if (existing.length) {
      convoId = existing[0].id;
    } else {
      const { data: newConvo, error: newError } = await supabase
        .from('conversations')
        .insert({ user1: user.id, user2: profile.id })
        .select('id')
        .single();

      if (newError) {
        console.error('Error creating conversation', newError);
        return;
      }
      convoId = newConvo.id;
    }

    await fetchChats();
    navigation.navigate('ChatDetail', {
      conversationId: convoId,
      otherUser: profile
    });
  };

  // renderiza cada chat existente
  const renderChat = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() =>
        navigation.navigate('ChatDetail', {
          conversationId: item.id,
          otherUser: {
            id: item.id,
            username: item.userName,
            avatar_url: item.avatar
          }
        })
      }
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.userName}>{item.userName}</Text>
          <Text style={styles.time}>{timeAgo(item.timestamp)}</Text>
        </View>
        <Text numberOfLines={1} style={styles.lastMessage}>
          {item.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // renderiza resultados de búsqueda
  const renderProfile = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => handleSelectUser(item)}
    >
      <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
      <View style={styles.chatInfo}>
        <Text style={styles.userName}>{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TopBar title="Chats" onBack={() => navigation.goBack()} />

      <View style={styles.searchWrapper}>
        <TextInput
          placeholder="Buscar usuarios..."
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
      </View>

      {query.trim() !== '' ? (
        <FlatList
          data={profiles}
          keyExtractor={item => item.id}
          renderItem={renderProfile}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <FlatList
          data={chats}
          keyExtractor={item => item.id}
          renderItem={renderChat}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd'
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 40
  },
  listContent: { paddingTop: 8 },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#ccc'
  },
  chatInfo: {
    flex: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
    paddingBottom: 12
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  userName: {
    fontWeight: '600',
    fontSize: 16
  },
  time: {
    fontSize: 12,
    color: '#777'
  },
  lastMessage: {
    fontSize: 14,
    color: '#555'
  }
});
