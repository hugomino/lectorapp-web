import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { UserContext } from '../context/UserContext';
import TopBar from '../components/TopBar';
import {
  getFinishedBooksForUser,
  getFinishedStatsForUser,
  getProfile,
  getFollowersCount,
  getFollowingCount
} from '../supabaseRest';

const screenWidth = Dimensions.get('window').width;
const coverSize = screenWidth / 3 - 12;

export default function ProfileScreen() {
  const { user } = useContext(UserContext);
  const navigation = useNavigation();

  const [profile, setProfile] = useState({ username: '', bio: '', avatar_url: '' });
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState({ libros: 0, paginas: 0, followers: 0, following: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Libros');

  useEffect(() => {
    if (!user?.id) return;

    (async () => {
      try {
        const prof = await getProfile(user.id);
        const terminados = await getFinishedBooksForUser(user.id);
        const { count, totalPages } = await getFinishedStatsForUser(user.id);
        const followers = await getFollowersCount(user.id);
        const following = await getFollowingCount(user.id);

        setProfile(prof);
        setBooks(terminados);
        setStats({
          libros: count || 0,
          paginas: totalPages || 0,
          followers,
          following
        });
      } catch (e) {
        console.error('Error cargando perfil:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const renderBook = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('FichaLibro', { book_id: item.id })}
    >
      <Image source={{ uri: item.cover_url }} style={styles.bookCover} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar title="Perfil" onBack={null} onSettings={() => navigation.navigate('Ajustes')} />

      <View style={styles.profileHeader}>
        <Image
          source={{
            uri: profile.avatar_url || 'https://via.placeholder.com/100/000000/FFFFFF?text=',
          }}
          style={styles.avatar}
        />

        <View style={styles.userInfo}>
          <Text style={styles.username}>@{profile.username || 'Usuario'}</Text>
          {!!profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{stats.libros}</Text>
              <Text style={styles.statLabel}>Libros leídos</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{stats.paginas}</Text>
              <Text style={styles.statLabel}>Páginas leídas</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{stats.following}</Text>
              <Text style={styles.statLabel}>Seguidos</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{stats.followers}</Text>
              <Text style={styles.statLabel}>Seguidores</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.tabBar}>
        {['Libros', 'Listas'].map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {activeTab === 'Libros' ? (
          <FlatList
            data={books}
            renderItem={renderBook}
            keyExtractor={item => item.id.toString()}
            numColumns={3}
            contentContainerStyle={styles.grid}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Aquí irán tus listas.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileHeader: {
    flexDirection: 'row',
    padding: 16
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eee'
  },
  userInfo: {
    flex: 1,
    marginLeft: 16
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  bio: {
    fontSize: 13,
    color: '#555',
    marginVertical: 4
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 8
  },
  statBlock: {
    marginRight: 24
  },
  statValue: {
    fontSize: 15,
    fontWeight: 'bold'
  },
  statLabel: {
    fontSize: 12,
    color: '#666'
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3478f6'
  },
  tabText: {
    fontSize: 14,
    color: '#666'
  },
  activeTabText: {
    color: '#3478f6',
    fontWeight: 'bold'
  },
  content: {
    flex: 1
  },
  grid: {
    padding: 4
  },
  bookCover: {
    width: coverSize,
    height: coverSize * 1.5,
    margin: 4,
    borderRadius: 6,
    backgroundColor: '#eee'
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  placeholderText: {
    fontSize: 14,
    color: '#888'
  }
});
