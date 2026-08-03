"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useAuth as useNewAuth } from '../hooks/useAuth';
import { createClient } from '../../supabase/client';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient()
  : null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: 'user' | 'organizer' | 'admin' | null;
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
  const { user, session, role, isLoading, signOut: newSignOut } = useNewAuth();

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    if (!supabase) return { data: null, error: new Error('Supabase not configured') };
    return supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone } }
    });
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { data: null, error: new Error('Supabase not configured') };
    return supabase.auth.signInWithPassword({ email, password });
  };

  const value = {
    user,
    session,
    role,
    signUp,
    signIn,
    signOut: async () => {
      await newSignOut();
    },
    loading: isLoading,
    isSupabaseConfigured: !!supabaseUrl,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
