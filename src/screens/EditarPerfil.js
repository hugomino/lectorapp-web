// src/screens/EditarPerfil.js
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../services/supabase';
import { UserContext } from '../context/UserContext';
import TopBar from '../components/TopBar';

export default function EditarPerfil() {
  const { user } = useContext(UserContext);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, bio, avatar_url')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error al obtener perfil', error);
      } else {
        setUsername(data.username || '');
        setBio(data.bio || '');
        setAvatarUrl(data.avatar_url || '');
      }
    };

    fetchProfile();
  }, [user.id]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8
    });

    if (!result.canceled) {
      const file = result.assets[0];
      const response = await fetch(file.uri);
      const blob = await response.blob();
      const filePath = `avatars/${user.id}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, { upsert: true });

      if (uploadError) {
        Alert.alert('Error', 'No se pudo subir la imagen');
        return;
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(urlData.publicUrl);
    }
  };

  const handleSave = async () => {
    setLoading(true);

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .neq('id', user.id)
      .maybeSingle();

    if (existing) {
      Alert.alert('Nombre en uso', 'Elige otro nombre de usuario.');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        username,
        bio,
        avatar_url: avatarUrl
      })
      .eq('id', user.id);

    if (error) {
      Alert.alert('Error', 'No se pudo guardar el perfil.');
    } else {
      Alert.alert('Listo', 'Perfil actualizado con éxito.');
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <TopBar title="Editar perfil" onBack={() => {}} onSettings={null} />

      <TouchableOpacity onPress={pickImage}>
        <Image
          source={{
            uri: avatarUrl || 'https://via.placeholder.com/100/000000/FFFFFF?text=',
          }}
          style={styles.avatar}
        />
        <Text style={styles.editPhoto}>Cambiar foto</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Nombre de usuario</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        placeholder="@nombre"
      />

      <Text style={styles.label}>Biografía</Text>
      <TextInput
        value={bio}
        onChangeText={(text) => text.length <= 150 && setBio(text)}
        style={[styles.input, styles.bio]}
        placeholder="Tu biografía..."
        multiline
        numberOfLines={3}
      />
      <Text style={styles.charCount}>{bio.length}/150</Text>

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, alignSelf: 'center', marginTop: 20 },
  editPhoto: { textAlign: 'center', color: '#3478f6', marginVertical: 8 },
  label: { marginTop: 20, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 6
  },
  bio: {
    height: 80,
    textAlignVertical: 'top'
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#888',
    marginBottom: 12
  },
  button: {
    backgroundColor: '#3478f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  }
});
