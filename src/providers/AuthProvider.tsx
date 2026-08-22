"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase-browser";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signInWithOAuth: (provider: "google" | "github") => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabaseRef = useRef<SupabaseClient | null>(null);

  useEffect(() => {
    const client = createClient();
    supabaseRef.current = client;

    const initializeAuth = async () => {
      try {
        const {
          data: { user },
        } = await client.auth.getUser();
        setUser(user ?? null);
      } catch (error) {
        console.error("Failed to initialize auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    const client = supabaseRef.current ?? createClient();
    const { error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
  };

  const signInWithPassword = async (email: string, password: string) => {
    const client = supabaseRef.current ?? createClient();
    const { error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signInWithOAuth = async (provider: "google" | "github") => {
    const client = supabaseRef.current ?? createClient();
    const { error } = await client.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
  };

  const resetPasswordForEmail = async (email: string) => {
    const client = supabaseRef.current ?? createClient();
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const client = supabaseRef.current ?? createClient();
    const { error } = await client.auth.signOut();
    if (error) throw error;
  };

  const signInAsGuest = async () => {
    const client = supabaseRef.current ?? createClient();
    const guestEmail = "guest@aetherq.com";
    const guestPassword = "guestpassword123!";
    
    // Attempt sign in first
    const { data, error } = await client.auth.signInWithPassword({
      email: guestEmail,
      password: guestPassword,
    });
    
    // If user doesn't exist, sign them up
    if (error && error.message.includes("Invalid login credentials")) {
      const { data: signUpData, error: signUpError } = await client.auth.signUp({
        email: guestEmail,
        password: guestPassword,
      });
      if (signUpError) throw signUpError;
      
      // Check if email confirmation is required (session will be null)
      if (signUpData.user && !signUpData.session) {
         throw new Error("Guest created, but email confirmation is ON. Please disable 'Confirm email' in Supabase Auth settings.");
      }
    } else if (error && error.message.includes("Email not confirmed")) {
      throw new Error("Email confirmation is ON. Please disable 'Confirm email' in Supabase Auth settings, or manually verify guest@aetherq.com.");
    } else if (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signUp,
        signInWithPassword,
        signInWithOAuth,
        resetPasswordForEmail,
        signOut,
        signInAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
