// src/screens/PantallaValoracionPendiente.js
import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { UserContext } from '../context/UserContext';

export default function PantallaValoracionPendiente() {
  const navigation = useNavigation();
  const route = useRoute();
  const { bookId } = route.params;
  const { user } = useContext(UserContext);

  const handleValorar = () => {
    navigation.navigate('ValorarLibro', { bookId });
  };

  const handleDejarParaMasTarde = () => {
    navigation.navigate('MainTabs', { screen: 'HomeScreen' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.thankYou}>¡Gracias por terminar el libro!</Text>
      <Text style={styles.explanation}>
        Tu valoración sincera ayuda a toda la comunidad lectora a descubrir libros increíbles.
      </Text>
      <Text style={styles.question}>¿Tienes tiempo ahora?</Text>
      <Text style={styles.reminder}>Este proceso dura sólo 1-2 minutos.</Text>

      <TouchableOpacity style={styles.primaryBtn} onPress={handleValorar}>
        <Text style={styles.primaryBtnText}>VALORAR</Text>
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
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 24
  },
  thankYou: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20
  },
  explanation: {
    fontSize: 16,
    textAlign: 'center',
    color: '#444',
    marginBottom: 24
  },
  question: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  reminder: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40
  },
  primaryBtn: {
    backgroundColor: '#3478f6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  skipText: {
    fontSize: 14,
    color: '#3478f6',
    textAlign: 'center'
  }
});
