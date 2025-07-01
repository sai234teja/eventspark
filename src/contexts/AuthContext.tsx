
import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, Session } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client only if credentials are available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  loading: boolean;
  isSupabaseConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const isSupabaseConfigured = !!supabase;

  useEffect(() => {
    if (!supabase) {
      // If Supabase is not configured, check for localStorage user (fallback)
      const localUser = localStorage.getItem("user");
      if (localUser) {
        try {
          const userData = JSON.parse(localUser);
          setUser({
            id: userData.id,
            email: userData.email,
            user_metadata: {
              full_name: userData.name || userData.fullName,
              phone: userData.phone
            },
            app_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            email_confirmed_at: new Date().toISOString(),
            phone_confirmed_at: null,
            confirmed_at: new Date().toISOString(),
            last_sign_in_at: new Date().toISOString(),
            role: 'authenticated',
            updated_at: new Date().toISOString()
          } as User);
        } catch (error) {
          console.error('Error parsing local user data:', error);
        }
      }
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    if (!supabase) {
      // Fallback for when Supabase is not configured
      const userData = {
        id: `user_${Date.now()}`,
        email,
        name: fullName,
        phone,
        fullName
      };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser({
        id: userData.id,
        email: userData.email,
        user_metadata: {
          full_name: fullName,
          phone: phone
        },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        phone_confirmed_at: null,
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        role: 'authenticated',
        updated_at: new Date().toISOString()
      } as User);
      return { data: { user: userData }, error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
        },
      },
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      // Fallback for when Supabase is not configured
      const userData = {
        id: `user_${Date.now()}`,
        email,
        name: email.split('@')[0]
      };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser({
        id: userData.id,
        email: userData.email,
        user_metadata: {
          full_name: userData.name
        },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        phone_confirmed_at: null,
        confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        role: 'authenticated',
        updated_at: new Date().toISOString()
      } as User);
      return { data: { user: userData }, error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    if (!supabase) {
      // Fallback for when Supabase is not configured
      localStorage.removeItem("user");
      setUser(null);
      return;
    }
    
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    signUp,
    signIn,
    signOut,
    loading,
    isSupabaseConfigured,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
