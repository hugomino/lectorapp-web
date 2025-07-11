// src/screens/WelcomeScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image source={require('../../assets/icon.png')} style={styles.logo} />

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Ya tengo cuenta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.outline]}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={[styles.buttonText, styles.outlineText]}>
            Crear cuenta
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  content: {
    alignItems: 'center',
    marginTop: -40
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: 30
  },
  button: {
    backgroundColor: '#3478f6',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
    width: 280 // ancho fijo para ambos botones
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#3478f6'
  },
  outlineText: {
    color: '#3478f6'
  }
});
