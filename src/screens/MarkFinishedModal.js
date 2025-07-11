// src/screens/MarkFinishedModal.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TopBar from '../components/TopBar';

export default function MarkFinishedModal() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TopBar title="Valorar libro" onBack={() => navigation.goBack()} />
      {/* Aquí detallarás el proceso de valoración más adelante */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' }
});
