import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import TopBar from '../components/TopBar';
import { supabase } from '../services/supabase';
import { UserContext } from '../context/UserContext';

export default function UpdatePageModal() {
  const navigation = useNavigation();
  const route = useRoute();
  const { bookId } = route.params;
  const { user } = useContext(UserContext);

  const [lastPage, setLastPage] = useState('0');
  const [newPage, setNewPage] = useState('0');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProgress = async () => {
      const { data, error } = await supabase
        .from('reading_progress')
        .select('current_page')
        .eq('user_id', user.id)
        .eq('book_id', bookId)
        .single();

      if (error) {
        console.error('Error fetching progress:', error);
      } else {
        const cp = data?.current_page ?? 0;
        setLastPage(cp.toString());
        setNewPage(cp.toString());
      }
    };
    fetchProgress();
  }, [bookId, user.id]);

  const save = async () => {
    const newPageNum = parseInt(newPage, 10);
    const lastPageNum = parseInt(lastPage, 10);
    if (isNaN(newPageNum) || newPageNum < 0) return;

    setLoading(true);

    const { error: updateError } = await supabase
      .from('reading_progress')
      .update({ current_page: newPageNum })
      .eq('user_id', user.id)
      .eq('book_id', bookId);

    if (updateError) {
      console.error('Error updating current_page:', updateError);
      setLoading(false);
      return;
    }

    const pagesRead = Math.max(newPageNum - lastPageNum, 0);
    if (pagesRead > 0) {
      const { error: logError } = await supabase
        .from('reading_logs')
        .insert({
          user_id: user.id,
          book_id: bookId,
          pages_read: pagesRead
        });

      if (logError) {
        console.error('Error inserting reading_log:', logError);
      }
    }

    setLoading(false);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TopBar title="Actualizar página" onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <Text style={styles.label}>Última página registrada</Text>
        <View style={styles.card}>
          <Text style={styles.lastPage}>{lastPage}</Text>
        </View>

        <Text style={styles.label}>Nueva página</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={newPage}
          onChangeText={setNewPage}
        />

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={save}
          disabled={loading}
        >
          <Text style={styles.saveText}>
            {loading ? 'Guardando...' : 'Guardar'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  content: { padding: 20 },
  label: {
    fontSize: 14,
    color: '#555',
    marginTop: 16,
    marginBottom: 6
  },
  card: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3
  },
  lastPage: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center'
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  saveButton: {
    marginTop: 32,
    backgroundColor: '#3478f6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4
  },
  saveButtonDisabled: {
    backgroundColor: '#aac4f6'
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});
