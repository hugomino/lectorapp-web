// src/screens/ChatDetailScreen.js
import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { UserContext } from '../context/UserContext';
import TopBar from '../components/TopBar';

export default function ChatDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { conversationId, otherUser } = route.params;
  const { user } = useContext(UserContext);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef();

  // formatea hora HH:MM
  const formatTime = (ts) => {
    const date = new Date(ts);
    const h = (`0${date.getHours()}`).slice(-2);
    const m = (`0${date.getMinutes()}`).slice(-2);
    return `${h}:${m}`;
  };

  // carga mensajes iniciales
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('id, sender_id, content, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      if (error) {
        console.error('Error loading messages', error);
      } else {
        setMessages(data);
      }
    };
    load();

    // suscripción a nuevos mensajes
    const subscription = supabase
      .from(`messages:conversation_id=eq.${conversationId}`)
      .on('INSERT', payload => {
        setMessages(msgs => [...msgs, payload.new]);
        // scroll al final
        flatListRef.current?.scrollToEnd({ animated: true });
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
    };
  }, [conversationId]);

  // envía un mensaje
  const sendMessage = async () => {
    const text = newMessage.trim();
    if (!text) return;
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: text
      });
    if (error) {
      console.error('Error sending message', error);
    } else {
      setNewMessage('');
      // scroll al enviar
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender_id === user.id;
    return (
      <View
        style={[
          styles.messageBubble,
          isMe ? styles.myBubble : styles.otherBubble
        ]}
      >
        <Text style={styles.messageText}>{item.content}</Text>
        <Text style={styles.messageTime}>
          {formatTime(item.created_at)}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <TopBar
        title={otherUser.username}
        onBack={() => navigation.goBack()}
        // opcionalmente mostrar avatar junto al título
      />
      <View style={styles.headerInfo}>
        <Image source={{ uri: otherUser.avatar_url }} style={styles.avatar} />
        <Text style={styles.headerName}>{otherUser.username}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un mensaje..."
          value={newMessage}
          onChangeText={setNewMessage}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
          <Text style={styles.sendBtnText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd'
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  headerName: { fontSize: 16, fontWeight: '600' },

  messagesList: { padding: 16, paddingBottom: 0 },

  messageBubble: {
    maxWidth: '75%',
    borderRadius: 12,
    padding: 8,
    marginBottom: 8
  },
  myBubble: {
    backgroundColor: '#e1ffc7',
    alignSelf: 'flex-end'
  },
  otherBubble: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start'
  },
  messageText: { fontSize: 14 },
  messageTime: {
    fontSize: 10,
    color: '#555',
    marginTop: 4,
    textAlign: 'right'
  },

  inputRow: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ddd'
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40
  },
  sendBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 16
  },
  sendBtnText: { color: '#3478f6', fontWeight: '600' }
});
