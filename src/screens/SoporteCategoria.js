import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import TopBar from '../components/TopBar';
import { useNavigation } from '@react-navigation/native';
import BottomSpacer from '../components/BottomSpacer';

const categorias = [
  { nombre: 'Libro', icono: '📚' },
  { nombre: 'Autor', icono: '🧑‍💼' },
  { nombre: 'Estadísticas', icono: '📊' },
  { nombre: 'Función/es', icono: '⚙️' },
  { nombre: 'Portadas', icono: '🖼️' },
  { nombre: 'Reseñas', icono: '✍️' },
  { nombre: 'Sugerencia general', icono: '🚀' },
  { nombre: 'Error técnico', icono: '🐞' }
];

export default function SoporteCategoria() {
  const navigation = useNavigation();

  const handleCategoria = (categoria) => {
    navigation.navigate('EnviarSugerencia', { categoria });
  };

  return (
    <View style={styles.container}>
      <TopBar title="Enviar sugerencia o error" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>Selecciona una categoría para que podamos ayudarte mejor:</Text>

        {categorias.map((cat) => (
          <TouchableOpacity
            key={cat.nombre}
            style={styles.card}
            onPress={() => handleCategoria(cat.nombre)}
          >
            <Text style={styles.cardText}>{cat.icono} {cat.nombre}</Text>
          </TouchableOpacity>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>

      <BottomSpacer height={24} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { paddingHorizontal: 24, paddingVertical: 28 },
  intro: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20
  },
  card: {
    backgroundColor: '#f7f7f7',
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2
  },
  cardText: {
    fontSize: 16,
    color: '#222'
  }
});
