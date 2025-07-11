// src/components/ReadingProgressBar.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ReadingProgressBar({ currentPage, totalPages }) {
  const pct = totalPages > 0 ? currentPage / totalPages : 0;
  const pctText = `${(pct * 100).toFixed(1)}%`;

  return (
    <View style={styles.progressSection}>
      <Text style={styles.pageText}>{currentPage} / {totalPages}</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progress, { flex: pct }]} />
        <View style={[styles.progressRemaining, { flex: 1 - pct }]} />
      </View>
      <Text style={styles.percentage}>{pctText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  progressSection: {
    marginTop: 16,
    marginBottom: 24,
    width: '100%',
    alignItems: 'center'
  },
  pageText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6
  },
  progressBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#eee',
    width: '100%'
  },
  progress: {
    backgroundColor: '#3478f6'
  },
  progressRemaining: {
    backgroundColor: '#eee'
  },
  percentage: {
    fontSize: 13,
    color: '#555',
    marginTop: 6
  }
});
