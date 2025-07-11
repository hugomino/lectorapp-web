// src/components/TutorialOverlay.js
import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Modal } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function TutorialOverlay({ visible, step, onNext }) {
  if (!visible || !step) return null;

  const { x, y, width, height, message } = step;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View
          style={[
            styles.highlight,
            {
              top: y - 10,
              left: x - 10,
              width: width + 20,
              height: height + 20
            }
          ]}
        />
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>{message}</Text>
          <TouchableOpacity style={styles.nextButton} onPress={onNext}>
            <Text style={styles.nextButtonText}>Siguiente</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(52, 120, 246, 0.85)',
    justifyContent: 'flex-start'
  },
  highlight: {
    position: 'absolute',
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderColor: '#ffffff90',
    borderWidth: 2
  },
  messageBox: {
    position: 'absolute',
    bottom: 80,
    left: 30,
    right: 30,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    textAlign: 'center'
  },
  nextButton: {
    backgroundColor: '#3478f6',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center'
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  }
});
