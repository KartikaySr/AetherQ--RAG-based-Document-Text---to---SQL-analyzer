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
    
    const guestEmail = process.env.NEXT_PUBLIC_GUEST_EMAIL || "guest@aetherq.com";
    const guestPassword = process.env.NEXT_PUBLIC_GUEST_PASSWORD || "guest123";

    try {
      const { error } = await client.auth.signInWithPassword({
        email: guestEmail,
        password: guestPassword,
      });

      if (error) {
        throw error;
      }
      
      // Set custom guest cookies for middleware detection
      document.cookie = "aetherq_guest_mode=true; path=/; max-age=86400";
      document.cookie = `aetherq_guest_id=guest_${Math.random().toString(36).substring(7)}; path=/; max-age=86400`;
    } catch (err: any) {
      console.error("Guest login failed:", err);
      throw new Error(err.message || "Failed to sign in as guest");
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
