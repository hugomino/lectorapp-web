// src/components/BookCard.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BookCard({
  cover,
  title,
  author,
  rating,
  reviewsCount,
  genres,
  year,
  onPress,
  onLike,
  onAddList,
  onDiscard
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: cover }} style={styles.cover} />

      <View style={styles.info}>
        <Text numberOfLines={1} style={styles.title}>{title}</Text>
        <Text numberOfLines={1} style={styles.author}>{author}</Text>

        <View style={styles.meta}>
          <Text style={styles.rating}>⭐ {rating.toFixed(1)}</Text>
          <Text style={styles.reviews}>({reviewsCount})</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={onLike} style={styles.actionBtn}>
            <Ionicons name="heart-outline" size={20} />
            <Text style={styles.actionText}>Me gusta</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onAddList} style={styles.actionBtn}>
            <Ionicons name="add-circle-outline" size={20} />
            <Text style={styles.actionText}>Añadir</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDiscard} style={styles.actionBtn}>
            <Ionicons name="close-outline" size={20} />
            <Text style={styles.actionText}>No me interesa</Text>
          </TouchableOpacity>
        </View>

        {Array.isArray(genres) && year ? (
          <Text numberOfLines={1} style={styles.tags}>
            {genres.join(' • ')} • {year}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
  },
  cover: {
    width: 100,
    height: 150,
  },
  info: {
    flex: 1,
    padding: 10,
  },
  title: { fontSize: 16, fontWeight: 'bold' },
  author: { fontSize: 14, color: '#555', marginBottom: 4 },
  meta: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  rating: { fontSize: 14, marginRight: 4 },
  reviews: { fontSize: 12, color: '#777' },
  actions: { flexDirection: 'row', marginBottom: 8 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  actionText: { fontSize: 12, marginLeft: 4 },
  tags: { fontSize: 12, color: '#888' },
});
