// src/screens/ValorarLibroScreen.js
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { UserContext } from '../context/UserContext';
import { supabase } from '../services/supabase';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TopBar from '../components/TopBar';
import BottomSpacer from '../components/BottomSpacer';

const criterios = [
  {
    key: 'recommend',
    icon: 'checkmark-circle',
    titulo: '¿Recomendarías este libro?',
    descripcion: 'Valora si recomendarías este libro a otras personas. Ten en cuenta tu experiencia general, sin importar si fue perfecto o no.'
  },
  {
    key: 'readability',
    icon: 'repeat',
    titulo: 'Facilidad de lectura',
    descripcion: '¿Te resultó fácil de leer? Ten en cuenta la claridad del lenguaje, la estructura y si fluyó de forma natural o no.'
  },
  {
    key: 'characters',
    icon: 'person',
    titulo: 'Personajes',
    descripcion: '¿Te parecieron interesantes, bien construidos y coherentes? ¿Te importaron sus historias? ¿Fueron memorables?'
  },
  {
    key: 'pacing',
    icon: 'time',
    titulo: 'Ritmo',
    descripcion: '¿La historia avanza con buen ritmo? ¿Te atrapó o se te hizo lenta en algunos tramos?'
  },
  {
    key: 'ending',
    icon: 'flag',
    titulo: 'Final',
    descripcion: '¿Te pareció satisfactorio el cierre de la historia? ¿Fue impactante, coherente, sorprendente o emotivo?'
  },
  {
    key: 'worldbuilding',
    icon: 'earth',
    titulo: 'Ambientación / Mundo / Escenario',
    descripcion: 'Valora si el entorno, época, universo o contexto del libro está bien construido y si ayuda a sumergirse en la historia.'
  },
  {
    key: 'impact',
    icon: 'sparkles',
    titulo: 'Impacto personal',
    descripcion: '¿Qué huella te dejó? Puede ser emocional, intelectual o reflexiva. ¿Cambió algo en ti, te hizo pensar, sentir o recordar?'
  },
  {
    key: 'overall',
    icon: 'star',
    titulo: 'Valoración general',
    descripcion: 'Tu nota global para este libro, teniendo en cuenta tu experiencia completa como lector/a.'
  }
];

export default function ValorarLibroScreen() {
  const { user } = useContext(UserContext);
  const navigation = useNavigation();
  const route = useRoute();
  const { bookId } = route.params;
  const [valores, setValores] = useState({});

  const handlePuntuar = (key, valor) => {
    setValores(prev => ({ ...prev, [key]: valor }));
  };

  const calcularWeightedRating = (valores) => {
    return (
      (valores.overall || 0) * 0.30 +
      (valores.recommend || 0) * 0.15 +
      (valores.characters || 0) * 0.10 +
      (valores.pacing || 0) * 0.10 +
      (valores.ending || 0) * 0.10 +
      (valores.worldbuilding || 0) * 0.10 +
      (valores.readability || 0) * 0.10 +
      (valores.impact || 0) * 0.05
    );
  };

  const handleEnviar = async () => {
    if (Object.keys(valores).length < criterios.length) {
      Alert.alert('Faltan puntuaciones', 'Valora todos los apartados antes de enviar.');
      return;
    }

    const weighted_rating = calcularWeightedRating(valores);

    const { error: ratingError } = await supabase
      .from('ratings')
      .insert({
        user_id: user.id,
        book_id: bookId,
        ...valores,
        weighted_rating
      });

    if (ratingError) {
      Alert.alert('Error al guardar valoración', ratingError.message);
      return;
    }

    const { error: updateError } = await supabase
      .from('reading_progress')
      .update({ finished: true })
      .eq('user_id', user.id)
      .eq('book_id', bookId);

    if (updateError) {
      Alert.alert('Error al marcar como leído', updateError.message);
      return;
    }

    Alert.alert('¡Gracias por tu valoración!', 'Tu opinión ayuda a toda la comunidad.', [
      {
        text: 'OK',
        onPress: () => navigation.navigate('MainTabs')
      }
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <TopBar title="Valora este libro" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.container}>
        {criterios.map((c, i) => (
          <View key={c.key} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name={c.icon} size={18} color="#3478f6" />
              <Text style={styles.sectionTitle}>{`${i + 1}. ${c.titulo}`}</Text>
            </View>
            <Text style={styles.sectionDesc}>{c.descripcion}</Text>

            <View style={styles.stars}>
              {Array.from({ length: 10 }, (_, idx) => (
                <TouchableOpacity
                  key={idx + 1}
                  onPress={() => handlePuntuar(c.key, idx + 1)}
                >
                  <Ionicons
                    name={valores[c.key] >= idx + 1 ? 'star' : 'star-outline'}
                    size={28}
                    color={valores[c.key] >= idx + 1 ? '#f5c039' : '#ccc'}
                    style={styles.starIcon}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.submit} onPress={handleEnviar}>
          <Text style={styles.submitText}>Enviar valoración</Text>
        </TouchableOpacity>

        <View style={{ height: 80 }} />
      </ScrollView>
      <BottomSpacer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#fff'
  },
  section: {
    marginBottom: 28
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  sectionDesc: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
    marginBottom: 10
  },
  stars: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4
  },
  starIcon: {
    marginRight: 2
  },
  submit: {
    marginTop: 16,
    backgroundColor: '#3478f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  }
});
