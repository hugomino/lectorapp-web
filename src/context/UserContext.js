// src/context/UserContext.js
import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export const UserContext = createContext({ user: null });

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // 1) Al montar, obtenemos la sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setInitializing(false);
    });

    // 2) Nos suscribimos a cambios de auth
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (initializing) return null; // o tu spinner de carga

  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
};
