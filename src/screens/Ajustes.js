// src/screens/Ajustes.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import TopBar from '../components/TopBar';
import BottomSpacer from '../components/BottomSpacer';

export default function Ajustes() {
  const navigation = useNavigation();

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            navigation.reset({ index: 0, routes: [{ name: 'PantallaInicio' }] });
          }
        }
      ]
    );
  };

  const handleNotReady = (title) => {
    Alert.alert(title, 'Esta función estará disponible próximamente.');
  };

  return (
    <View style={styles.container}>
      <TopBar title="Ajustes" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>Lecturas</Text>

          <TouchableOpacity onPress={() => navigation.navigate('EliminarLecturaActual')}>
            <Text style={styles.option}>Eliminar lectura actual</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('EliminarLibroTerminado')}>
            <Text style={styles.option}>Eliminar libros terminados</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>Cuenta</Text>

          <TouchableOpacity onPress={() => handleNotReady('Cambiar contraseña')}>
            <Text style={styles.option}>Cambiar contraseña</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleNotReady('Eliminar cuenta')}>
            <Text style={styles.option}>Eliminar cuenta</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionBox}>
          <Text style={styles.sectionTitle}>Soporte y otros</Text>

          <TouchableOpacity onPress={() => navigation.navigate('SoporteCategoria')}>
            <Text style={styles.option}>Enviar sugerencia o reportar error</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('PoliticaPrivacidad')}>
            <Text style={styles.option}>Política de privacidad</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('TerminosDeUso')}>
            <Text style={styles.option}>Términos de uso</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.disabled}>Versión de la app: 1.0.0</Text>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>

        <BottomSpacer height={24} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 28
  },
  sectionBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 28
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  option: {
    fontSize: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  disabled: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 30
  },
  logoutButton: {
    marginTop: 0,
    paddingVertical: 15,
    alignItems: 'center'
  },
  logoutText: {
    fontSize: 16,
    color: 'red',
    fontWeight: 'bold'
  }
});
