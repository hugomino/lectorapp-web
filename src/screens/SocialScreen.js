// src/screens/SocialScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import TopBar from '../components/TopBar';

export default function SocialScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TopBar
        title="Social"
        onBack={null}
        onSettings={() => navigation.navigate('Profile')}
      />
      <View style={styles.content}>
        <Text style={styles.placeholderText}>
          Aquí irá la sección social...
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  placeholderText: {
    fontSize: 16,
    color: '#777'
  }
});
