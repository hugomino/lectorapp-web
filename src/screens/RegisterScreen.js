// src/screens/RegisterScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert
} from 'react-native';
import { supabase } from '../services/supabase';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername]       = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { username: username.trim() } }
    });
    if (error) {
      Alert.alert('Error al registrarse', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Cuenta</Text>

      <TextInput
        placeholder="Nombre de usuario"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        style={styles.input}
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          style={styles.passwordInput}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={24}
            color="#3478f6"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrarse</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title:     { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  input:     { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 20 },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
  },
  button:    { backgroundColor: '#3478f6', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText:{ color: '#fff', fontWeight: 'bold' },
  link:      { marginTop: 20, textAlign: 'center', color: '#3478f6' },
});
