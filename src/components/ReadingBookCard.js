// src/components/ReadingBookCard.js
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const COVER_HEIGHT = SCREEN_HEIGHT * 0.42;

export default function ReadingBookCard({
  cover,
  title,
  author,
  currentPage,
  totalPages,
  confirmed = false,
  onUpdatePage,
  onMarkFinished,
  onPressCover
}) {
  const pct = totalPages > 0 ? currentPage / totalPages : 0;
  const pctText = `${(pct * 100).toFixed(1)}%`;

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={[styles.coverContainer, { height: COVER_HEIGHT }]}
        onPress={onPressCover}
        activeOpacity={0.9}
      >
        {cover ? (
          <Image
            source={{ uri: cover }}
            style={styles.cover}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.coverPlaceholder} />
        )}
      </TouchableOpacity>

      <View style={styles.info}>
        <View>
          <View style={styles.titleRow}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={confirmed ? '#3498db' : '#ccc'}
              style={{ marginRight: 4 }}
            />
            <Text numberOfLines={1} style={styles.title}>
              {title}
            </Text>
          </View>
          <Text numberOfLines={1} style={styles.author}>{author}</Text>
        </View>

        <View style={styles.progressSection}>
          <Text style={styles.pageText}>
            {Number.isFinite(currentPage) && Number.isFinite(totalPages)
              ? `${currentPage} / ${totalPages}`
              : '– / –'}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progress, { flex: pct }]} />
            <View style={[styles.progressRemaining, { flex: 1 - pct }]} />
          </View>
          <Text style={styles.percentage}>{pctText}</Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={onUpdatePage} style={styles.btnBox}>
            <Text style={styles.btnBoxText}>Actualizar página</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onMarkFinished} style={[styles.btnBox, styles.btnDone]}>
            <Text style={styles.btnBoxText}>Terminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    justifyContent: 'space-between'
  },
  coverContainer: {
    width: '100%',
    marginTop: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cover: {
    width: '100%',
    height: '100%'
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 6
  },
  info: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between'
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1
  },
  author: {
    fontSize: 14,
    color: '#555',
    marginTop: 4
  },
  progressSection: {
    marginTop: 12
  },
  pageText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 6
  },
  progressBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#eee'
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
    textAlign: 'center',
    marginTop: 6
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 16
  },
  btnBox: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#3478f6',
    borderRadius: 6,
    alignItems: 'center'
  },
  btnDone: {
    backgroundColor: '#34c759'
  },
  btnBoxText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14
  }
});
