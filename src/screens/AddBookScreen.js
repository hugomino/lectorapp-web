// src/screens/AddBookScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../services/supabase';
import { decode } from 'base64-arraybuffer';
import { useNavigation, useRoute } from '@react-navigation/native';
import TopBar from '../components/TopBar';
import BottomSpacer from '../components/BottomSpacer';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function AddBookScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const fromAddReading = route.params?.fromAddReading || false;

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [pages, setPages] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [helpVisible, setHelpVisible] = useState([]);

  const toggleHelp = key => {
    setHelpVisible(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleContinue = async () => {
    if (!title || !author || !isbn || !pages) {
      Alert.alert('Faltan campos obligatorios', 'Rellena título, autor, ISBN y número de páginas.');
      return;
    }

    let coverUrl = null;

    if (image?.base64) {
      try {
        setUploading(true);
        const fileExt = image.uri.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('book-covers')
          .upload(filePath, decode(image.base64), {
            contentType: 'image/*'
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('book-covers')
          .getPublicUrl(filePath);
        coverUrl = data.publicUrl;
      } catch (error) {
        console.error('Error subiendo imagen:', error.message);
        Alert.alert('Error', 'No se pudo subir la imagen.');
        setUploading(false);
        return;
      }
    }

    setUploading(false);

    navigation.navigate('ConfirmAddBook', {
      title,
      author,
      isbn,
      pages,
      synopsis,
      cover_url: coverUrl,
      image,
      fromAddReading
    });
  };

  const renderHelp = key => (
    helpVisible.includes(key) && (
      <Text style={styles.helpText}>
        {key === 'title' && 'Escribe el título completo del libro.'}
        {key === 'author' && 'Pon el nombre del autor o autora tal como aparece en el libro.'}
        {key === 'isbn' && 'Introduce sólo números. Puede aparecer en la contraportada o en la primera página del libro.'}
        {key === 'pages' && 'Corresponde a la página donde termina la lectura del libro.'}
        {key === 'synopsis' && 'Probablemente se encuentre en la contraportada.'}
        {key === 'cover' && 'Debe ser una imagen limpia y profesional, no una foto tomada. Mejor si se descarga del sitio oficial.'}
      </Text>
    )
  );

  return (
    <View style={styles.container}>
      <TopBar title="Añadir libro" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.form}>

        <View style={styles.fieldBlock}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Título</Text>
            <TouchableOpacity onPress={() => toggleHelp('title')}>
              <Ionicons name="information-circle-outline" size={18} color="#888" />
            </TouchableOpacity>
          </View>
          {renderHelp('title')}
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Título del libro" />
        </View>

        <View style={styles.fieldBlock}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Autor/a</Text>
            <TouchableOpacity onPress={() => toggleHelp('author')}>
              <Ionicons name="information-circle-outline" size={18} color="#888" />
            </TouchableOpacity>
          </View>
          {renderHelp('author')}
          <TextInput style={styles.input} value={author} onChangeText={setAuthor} placeholder="Nombre del autor/a" />
        </View>

        <View style={styles.fieldBlock}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>ISBN</Text>
            <TouchableOpacity onPress={() => toggleHelp('isbn')}>
              <Ionicons name="information-circle-outline" size={18} color="#888" />
            </TouchableOpacity>
          </View>
          {renderHelp('isbn')}
          <TextInput
            style={styles.input}
            value={isbn}
            onChangeText={setIsbn}
            placeholder="ISBN"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.fieldBlock}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Páginas</Text>
            <TouchableOpacity onPress={() => toggleHelp('pages')}>
              <Ionicons name="information-circle-outline" size={18} color="#888" />
            </TouchableOpacity>
          </View>
          {renderHelp('pages')}
          <TextInput
            style={styles.input}
            value={pages}
            onChangeText={setPages}
            placeholder="Número total de páginas"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.fieldBlock}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Sinopsis</Text>
            <TouchableOpacity onPress={() => toggleHelp('synopsis')}>
              <Ionicons name="information-circle-outline" size={18} color="#888" />
            </TouchableOpacity>
          </View>
          {renderHelp('synopsis')}
          <TextInput
            style={[styles.input, styles.multiline]}
            value={synopsis}
            onChangeText={setSynopsis}
            placeholder="Resumen breve del libro"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.fieldBlock}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Portada</Text>
            <TouchableOpacity onPress={() => toggleHelp('cover')}>
              <Ionicons name="information-circle-outline" size={18} color="#888" />
            </TouchableOpacity>
          </View>
          {renderHelp('cover')}
          <TouchableOpacity style={[styles.imageBtn, { width: '100%' }]} onPress={handleImagePick}>
            <Text style={styles.imageBtnText}>
              {image ? 'Cambiar portada' : 'Subir portada (opcional)'}
            </Text>
          </TouchableOpacity>
        </View>

        {image?.uri && (
          <Image source={{ uri: image.uri }} style={styles.preview} resizeMode="contain" />
        )}

        <TouchableOpacity
          style={[styles.submitBtn, uploading && { backgroundColor: '#ccc' }]}
          onPress={handleContinue}
          disabled={uploading}
        >
          <Text style={styles.submitBtnText}>
            {uploading ? 'Procesando...' : 'Continuar'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 80 }} />
      </ScrollView>
      <BottomSpacer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  form: { padding: 20 },
  label: { fontWeight: 'bold', marginBottom: 6 },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 40
  },
  multiline: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10
  },
  imageBtn: {
    backgroundColor: '#eee',
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 16,
    alignItems: 'center'
  },
  imageBtnText: { color: '#333' },
  preview: {
    width: '100%',
    height: 200,
    marginTop: 10,
    borderRadius: 6
  },
  submitBtn: {
    backgroundColor: '#3478f6',
    marginTop: 30,
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center'
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },
  helpText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
    fontStyle: 'italic'
  },
  fieldBlock: {
    marginBottom: 10
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  }
});
