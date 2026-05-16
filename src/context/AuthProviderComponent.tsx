 import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js';

import { useNavigate } from 'react-router-dom';

import { supabase } from '../lib/supabase';

import { AuthContext } from './authContext';
import type { AuthContextValue } from './authContext';

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;

        setSession(data.session);
        setUser(data.session?.user ?? null);
      })
      .catch((error) => {
        console.error('Supabase getSession error:', error);
      })
      .finally(() => {
        if (!mounted) return;

        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      console.log('Auth state changed:', event, session?.user?.id ?? null);
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('signInWithPassword response:', data, error);
      if (error) throw error;
      if (!data.session) {
        throw new Error('فشل تسجيل الدخول. تأكد من صحة بياناتك أو حالة الحساب.');
      }
    },
    []
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signUp(
        {
          email,
          password,
        },
        {
          emailRedirectTo: window.location.origin,
        }
      );

      console.log('signUp response:', data, error);
      if (error) throw error;

      return {
        user: data.user ?? null,
        session: data.session ?? null,
      };
    },
    []
  );

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    navigate('/login', {
      replace: true,
    });
  }, [navigate]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      signInWithPassword,
      signUp,
      signOut,
    }),
    [
      user,
      session,
      loading,
      signInWithPassword,
      signUp,
      signOut,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}