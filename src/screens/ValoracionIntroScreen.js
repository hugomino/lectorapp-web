import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../services/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ValoracionIntroScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { bookId, totalPages } = route.params;

  const handleDejarParaMasTarde = async () => {
    // Solo actualizamos el current_page, no lo marcamos como terminado
    await supabase
      .from('reading_progress')
      .update({ current_page: totalPages })
      .eq('book_id', bookId);

    navigation.navigate('Home');
  };

  const handleValorar = () => {
    navigation.navigate('ValorarLibro', { bookId });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Gracias por terminar el libro!</Text>
      <Text style={styles.subtitle}>
        Tu valoración sincera ayuda a otros lectores como tú a encontrar los mejores libros.
      </Text>
      <Text style={styles.notice}>
        Este paso solo tomará un par de minutos. ¿Tienes un momento para valorarlo ahora?
      </Text>

      <TouchableOpacity style={styles.primaryButton} onPress={handleValorar}>
        <Text style={styles.primaryText}>VALORAR</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleDejarParaMasTarde}>
        <Text style={styles.skipText}>Dejar para más tarde</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
    marginBottom: 20
  },
  notice: {
    fontSize: 14,
    textAlign: 'center',
    color: '#777',
    marginBottom: 40
  },
  primaryButton: {
    backgroundColor: '#3478f6',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 24
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  skipText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#3478f6'
  }
});
