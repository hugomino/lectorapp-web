import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import TopBar from '../components/TopBar';
import BottomSpacer from '../components/BottomSpacer';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function EnviarSugerencia() {
  const route = useRoute();
  const navigation = useNavigation();
  const { categoria } = route.params;

  const [mensaje, setMensaje] = useState('');
  const [imagen, setImagen] = useState(null);

  const handleEnviar = () => {
    if (!mensaje.trim()) {
      Alert.alert('Error', 'Por favor, escribe tu sugerencia o reporte.');
      return;
    }

    // Aquí iría la lógica de envío (ej. Supabase, email, etc.)
    Alert.alert(
      'Gracias',
      'Tu mensaje ha sido enviado. Lo revisaremos lo antes posible.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const seleccionarImagen = async () => {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7
    });

    if (!resultado.canceled) {
      setImagen(resultado.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <TopBar title={categoria} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Explica el error o la sugerencia:</Text>
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={6}
          placeholder="Escribe aquí..."
          value={mensaje}
          onChangeText={setMensaje}
        />

        <TouchableOpacity style={styles.imageButton} onPress={seleccionarImagen}>
          <Text style={styles.imageButtonText}>
            {imagen ? 'Cambiar imagen' : 'Añadir imagen (opcional)'}
          </Text>
        </TouchableOpacity>

        {imagen && <Image source={{ uri: imagen }} style={styles.imagePreview} />}

        <TouchableOpacity style={styles.sendButton} onPress={handleEnviar}>
          <Text style={styles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>

      <BottomSpacer height={24} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  label: { fontSize: 16, marginBottom: 10, fontWeight: '500', color: '#222' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    textAlignVertical: 'top',
    backgroundColor: '#fafafa'
  },
  imageButton: {
    marginTop: 20,
    backgroundColor: '#e0e0e0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  imageButtonText: {
    fontSize: 15,
    color: '#333'
  },
  imagePreview: {
    marginTop: 12,
    width: '100%',
    height: 180,
    borderRadius: 8,
    resizeMode: 'cover'
  },
  sendButton: {
    marginTop: 30,
    backgroundColor: '#3478f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});
