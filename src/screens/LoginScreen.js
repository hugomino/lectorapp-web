// src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, Platform
} from 'react-native';
import { supabase } from '../services/supabase';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function LoginScreen({ navigation }) {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });
    if (error) {
      Alert.alert('Error al iniciar sesión', error.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Introduce tu email primero', 'Es necesario un correo para restablecer la contraseña.');
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: 'https://tuapp.com/reset-password'
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Revisa tu correo', 'Te hemos enviado un enlace para restablecer tu contraseña.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LectorApp</Text>

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

      <TouchableOpacity onPress={handleForgotPassword}>
        <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, justifyContent: 'center', padding: 20 },
  title:        { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },
  input:        { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 20 },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
  },
  forgotText: {
    textAlign: 'right',
    color: '#3478f6',
    marginBottom: 20
  },
  button: {
    backgroundColor: '#3478f6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  link:       { marginTop: 20, textAlign: 'center', color: '#3478f6' },
});
