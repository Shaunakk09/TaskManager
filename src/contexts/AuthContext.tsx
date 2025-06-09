/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AuthError } from '@supabase/supabase-js';
import { supabase } from '~/lib/supabase';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        if (!user || user.id !== session.user.id) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata.name,
          });
        }
      } else {
        if (user !== null) {
          setUser(null);
        }
      }
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        if (!user || user.id !== session.user.id) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata.name,
          });
        }
      } else {
        if (user !== null) {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [user]);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 