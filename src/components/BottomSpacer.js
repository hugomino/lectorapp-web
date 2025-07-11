// src/components/BottomSpacer.js
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

export default function BottomSpacer() {
  return <View style={styles.spacer} />;
}

const styles = StyleSheet.create({
  spacer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 68 : 48, // ⬅️ altura duplicada para cubrir completamente
    backgroundColor: '#fff',
    zIndex: 10
  }
});
