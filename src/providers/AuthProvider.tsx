"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase-browser";

type AuthContextType = {
  user: User | null;
  guestName: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signInWithOAuth: (provider: "google" | "github") => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: (name: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [guestName, setGuestName] = useState<string | null>(null);
  const supabaseRef = useRef<SupabaseClient | null>(null);

  useEffect(() => {
    const client = createClient();
    supabaseRef.current = client;

    const initializeAuth = async () => {
      try {
        // Check for guest mode from localStorage
        const guestMode = localStorage.getItem("aetherq_guest_mode") === "true";
        const storedGuestName = localStorage.getItem("aetherq_guest_name");
        if (guestMode) {
          setIsGuest(true);
          setGuestName(storedGuestName || "Guest");
          setIsLoading(false);
          return;
        }

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

  const signUp = async (email: string, password: string) => {
    const client = supabaseRef.current ?? createClient();
    const { error } = await client.auth.signUp({
      email,
      password,
      options: {
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
    
    // Clear guest mode if active
    if (isGuest) {
      localStorage.removeItem("aetherq_guest_mode");
      localStorage.removeItem("aetherq_guest_id");
      localStorage.removeItem("aetherq_guest_name");
      document.cookie = "aetherq_guest_mode=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "aetherq_guest_id=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "aetherq_guest_name=; path=/; max-age=0; SameSite=Lax";
      setIsGuest(false);
      setGuestName(null);
      setUser(null);
      return;
    }

    const { error } = await client.auth.signOut();
    if (error) throw error;
  };

  const continueAsGuest = (name: string) => {
    const safeName = name.trim() || "Guest";
    const existingGuestId = localStorage.getItem("aetherq_guest_id");
    const guestId = existingGuestId || crypto.randomUUID();

    localStorage.setItem("aetherq_guest_mode", "true");
    localStorage.setItem("aetherq_guest_id", guestId);
    localStorage.setItem("aetherq_guest_name", safeName);
    document.cookie = "aetherq_guest_mode=true; path=/; max-age=86400; SameSite=Lax";
    document.cookie = `aetherq_guest_id=${guestId}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `aetherq_guest_name=${encodeURIComponent(
      safeName
    )}; path=/; max-age=86400; SameSite=Lax`;
    setIsGuest(true);
    setGuestName(safeName);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        guestName,
        isLoading,
        isAuthenticated: !!user || isGuest,
        isGuest,
        signUp,
        signInWithPassword,
        signInWithOAuth,
        resetPasswordForEmail,
        signOut,
        continueAsGuest,
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
