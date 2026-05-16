import { createContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { ReactNode } from 'react';

export type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{
    user: User | null;
    session: Session | null;
  }>;
  signOut: () => Promise<void>;
};

export type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

