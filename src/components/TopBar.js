// src/components/TopBar.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function TopBar({ title, onBack, rightIcon, leftIcon }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.inner}>
        {onBack ? (
          <TouchableOpacity style={styles.back} onPress={onBack}>
            {leftIcon ?? <Ionicons name="arrow-back" size={22} color="#000" />}
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder}>
            {leftIcon && typeof leftIcon !== 'string' ? leftIcon : <View style={styles.placeholder} />}
          </View>
        )}

        <Text style={styles.title}>{title}</Text>

        <View style={styles.right}>
          {rightIcon ?? <View style={styles.placeholder} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee'
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  back: {
    padding: 4
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    flex: 1
  },
  right: {
    minWidth: 32,
    alignItems: 'flex-end'
  },
  placeholder: {
    width: 32
  }
});
