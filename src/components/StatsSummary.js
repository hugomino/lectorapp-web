// src/components/StatsSummary.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function StatsSummary({ booksFinished, pagesRead, streak, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.container}>
      <View style={styles.block}>
        <Text style={styles.value}>{String(booksFinished ?? '—')}</Text>
        <Text style={styles.label}>Libros</Text>
      </View>
      <View style={styles.block}>
        <Text style={styles.value}>{String(pagesRead ?? '—')}</Text>
        <Text style={styles.label}>Páginas</Text>
      </View>
      <View style={styles.block}>
        <Text style={styles.value}>{String(streak ?? '—')}</Text>
        <Text style={styles.label}>Racha</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2
  },
  block: {
    alignItems: 'center'
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000'
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  }
});
