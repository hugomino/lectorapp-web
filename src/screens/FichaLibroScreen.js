import React, { useEffect, useState, useRef, useContext } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  Linking
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../services/supabase';
import TopBar from '../components/TopBar';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BottomSpacer from '../components/BottomSpacer';
import { UserContext } from '../context/UserContext';
import ReadingProgressBar from '../components/ReadingProgressBar';

export default function FichaLibro({ route, navigation }) {
  const { user } = useContext(UserContext);
  const { book_id } = route.params;
  const [book, setBook] = useState(null);
  const [rating, setRating] = useState(null);
  const [ratingCount, setRatingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [infoOpacity] = useState(new Animated.Value(0));
  const [infoBoxTop, setInfoBoxTop] = useState(140);
  const [alreadyReading, setAlreadyReading] = useState(false);
  const [progressData, setProgressData] = useState(null);
  const iconRef = useRef();

  const loadData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('books')
      .select('id, title, author, cover_url, synopsis, affiliate_url')
      .eq('id', book_id)
      .single();

    const { data: ratingData } = await supabase
      .from('ratings')
      .select('weighted_rating')
      .eq('book_id', book_id);

    const { data: progress } = await supabase
      .from('reading_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('book_id', book_id)
      .eq('finished', false)
      .maybeSingle();

    if (data) setBook(data);
    if (ratingData?.length) {
      const avg = ratingData.reduce((sum, r) => sum + (r.weighted_rating || 0), 0) / ratingData.length;
      setRating(avg);
      setRatingCount(ratingData.length);
    }

    if (progress) {
      setAlreadyReading(true);
      setProgressData(progress);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [book_id]);

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true
    });

    if (!result.canceled) {
      const image = result.assets[0];
      try {
        setUploading(true);
        const fileExt = image.uri.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        await supabase.storage
          .from('book-covers')
          .upload(filePath, decode(image.base64), {
            contentType: 'image/*'
          });

        const { data } = supabase.storage.from('book-covers').getPublicUrl(filePath);
        const coverUrl = data.publicUrl;

        await supabase.from('books').update({ cover_url: coverUrl }).eq('id', book_id);
        await loadData();
        Alert.alert('¡Gracias!', 'La portada ha sido añadida correctamente.');
      } catch (e) {
        console.error('Error al subir portada', e.message);
        Alert.alert('Error', 'No se pudo subir la portada.');
      } finally {
        setUploading(false);
      }
    }
  };

  const showInfoBox = () => {
    if (iconRef.current) {
      iconRef.current.measure((fx, fy, width, height, px, py) => {
        setInfoBoxTop(py + height + 8);
      });
    }

    setShowInfo(true);
    Animated.timing(infoOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      setTimeout(() => {
        Animated.timing(infoOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }).start(() => setShowInfo(false));
      }, 5000);
    });
  };

  const getRatingColor = (value) => {
    if (value >= 8) return { bg: '#f1fef3', border: '#4CAF50', text: '#4CAF50' };
    if (value >= 6) return { bg: '#fffbea', border: '#f1c40f', text: '#f1c40f' };
    return { bg: '#fff5f5', border: '#e74c3c', text: '#e74c3c' };
  };

  const handleBottomButton = () => {
    if (alreadyReading) {
      navigation.navigate('UpdatePageModal', { bookId: book_id });
    } else {
      navigation.navigate('AddReadingDetail', {
        title: book.title,
        author: book.author,
        isbn: '',
        pages: 0,
        synopsis: book.synopsis || '',
        cover_url: book.cover_url || '',
        book_id: book.id
      });
    }
  };

  const ratingColors = getRatingColor(rating ?? 0);

  if (loading || !book) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3478f6" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f9f9f9' }}>
      <TopBar
        title={book.title}
        onBack={() => navigation.goBack()}
        centerTitle
        rightIcon={<Ionicons name="warning-outline" size={22} color="#e74c3c" />}
        onRightPress={() => navigation.navigate('SoporteCategoria')}
      />

      <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center', paddingBottom: 100 }}>
        <View style={{ width: 240, height: 340, backgroundColor: '#eee', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
          {book.cover_url ? (
            <Image source={{ uri: book.cover_url }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 12 }}>
              <Text style={{ color: '#888', marginBottom: 10 }}>Sin portada</Text>
              <TouchableOpacity
                style={{ backgroundColor: '#3478f6', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 }}
                onPress={handleImagePick}
                disabled={uploading}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>
                  {uploading ? 'Subiendo...' : 'Subir portada'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#222', textAlign: 'center', marginBottom: 4 }}>{book.title}</Text>

        <TouchableOpacity onPress={() => navigation.navigate('FichaAutor', { author: book.author })}>
          <Text style={{ fontSize: 16, color: '#3478f6', fontWeight: '500', marginBottom: 12 }}>de {book.author}</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <TouchableOpacity ref={iconRef} onPress={showInfoBox} style={{ marginRight: 10 }}>
            <Ionicons name="checkmark-circle" size={28} color="#3498db" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('ValoracionesDetalle', { book_id: book.id })}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 20,
              borderWidth: 1,
              backgroundColor: ratingColors.bg,
              borderColor: ratingColors.border
            }}
          >
            <Ionicons name="star" size={24} color={ratingColors.text} style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 16, fontWeight: '600', color: ratingColors.text }}>
              {rating !== null ? `${rating.toFixed(2)} (${ratingCount})` : '-'}
            </Text>
          </TouchableOpacity>
        </View>

        {showInfo && (
          <Animated.View style={{ position: 'absolute', alignSelf: 'center', backgroundColor: '#e8f4ff', padding: 12, borderRadius: 8, zIndex: 10, elevation: 4, opacity: infoOpacity, top: infoBoxTop }}>
            <Text style={{ color: '#1b70b1', fontSize: 13, textAlign: 'center' }}>
              La información de este libro ha sido verificada por un desarrollador
            </Text>
          </Animated.View>
        )}

        {alreadyReading && progressData && (
          <View style={{ width: '100%', marginBottom: 10 }}>
            <ReadingProgressBar
              currentPage={progressData.current_page}
              totalPages={progressData.total_pages}
            />
          </View>
        )}

        <View style={{ height: 1, backgroundColor: '#eee', width: '100%', marginVertical: 18 }} />

        <Text style={{ fontSize: 18, fontWeight: '600', alignSelf: 'flex-start', marginBottom: 8, color: '#333' }}>Sinopsis</Text>
        <View style={{ backgroundColor: '#fff', padding: 14, borderRadius: 10, width: '100%', borderWidth: 1, borderColor: '#eee' }}>
          <Text style={book.synopsis ? { fontSize: 15, color: '#444', textAlign: 'justify', lineHeight: 22 } : { fontSize: 14, fontStyle: 'italic', color: '#999', textAlign: 'center' }}>
            {book.synopsis || 'Este libro no tiene sinopsis aún.'}
          </Text>
        </View>
      </ScrollView>

      <View style={{ position: 'absolute', bottom: 55, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: '#3478f6', paddingVertical: 14, borderRadius: 12, alignItems: 'center', elevation: 4, marginRight: 10 }} onPress={handleBottomButton}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
            {alreadyReading ? 'Actualizar página' : 'Añadir a lectura'}
          </Text>
        </TouchableOpacity>

        {book.affiliate_url && (
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: '#ff9900', paddingVertical: 14, borderRadius: 12, alignItems: 'center', elevation: 4 }}
            onPress={() => Linking.openURL(book.affiliate_url)}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Comprar en Amazon</Text>
          </TouchableOpacity>
        )}
      </View>

      <BottomSpacer />
    </View>
  );
}
