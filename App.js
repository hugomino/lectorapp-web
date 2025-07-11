// App.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './src/navigation/AuthStack';
import AppStack from './src/navigation/AppStack';
import { UserContext } from './src/context/UserContext';
import { supabase } from './src/services/supabase';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        const { id } = data.user;
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', id)
          .single();

        setUser({ id, username: profile?.username || 'Sin nombre' });
      }
      setLoading(false);
    };

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const { id } = session.user;
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', id)
            .single();

          setUser({ id, username: profile?.username || 'Sin nombre' });
        } else {
          setUser(null);
        }
      }
    );

    return () => listener?.subscription?.unsubscribe?.();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3478f6" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <UserContext.Provider value={{ user, setUser }}>
        <NavigationContainer>
          {user ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
      </UserContext.Provider>
    </SafeAreaProvider>
  );
}
