import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signIn as apiSignIn, 
  signUp as apiSignUp, 
  signOut as apiSignOut,
  supabase
} from '../lib/supabase';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    // --- FIX 2: Proper session restoration on refresh ---
    // For live Supabase: use onAuthStateChange which fires immediately with current session
    if (supabase) {
      // Get existing session on mount
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(normalizeUser(session.user));
        }
        setLoading(false);
      });

      // Listen for auth state changes (login, logout, token refresh)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(normalizeUser(session.user));
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // Mock mode: restore from localStorage
      try {
        const session = localStorage.getItem('musehaus_session');
        const parsed = session ? JSON.parse(session) : null;
        setUser(parsed || null);
      } catch {
        setUser(null);
      }
      setLoading(false);
    }
  }, []);

  // Normalize Supabase user object to a flat structure
  const normalizeUser = (supabaseUser) => {
    if (!supabaseUser) return null;
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      full_name: supabaseUser.user_metadata?.full_name || '',
      phone: supabaseUser.user_metadata?.phone || '',
      interests: supabaseUser.user_metadata?.interests || [],
      avatar_url: supabaseUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${supabaseUser.id}`,
      created_at: supabaseUser.created_at
    };
  };

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await apiSignIn(email, password);
      if (error) {
        showToast(error.message || "Failed to sign in.", "error");
        return { success: false, error };
      }
      // onAuthStateChange will set the user automatically in live mode
      // For mock mode, set it manually
      if (!supabase) setUser(data.user);
      showToast(`Welcome back, ${data.user.full_name || 'Artisan'}!`, "success");
      return { success: true };
    } catch (err) {
      showToast("An unexpected error occurred during sign in.", "error");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, fullName, phone, interests) => {
    setLoading(true);
    try {
      const { data, error } = await apiSignUp(email, password, fullName, phone, interests);
      if (error) {
        showToast(error.message || "Failed to sign up.", "error");
        return { success: false, error };
      }
      // In live mode with email confirmation, data.session is null until confirmed
      // In mock mode or if email confirmation is off, session is returned immediately
      if (data?.user && !supabase) {
        setUser(data.user);
      }
      return { success: true, requiresEmailConfirmation: supabase && !data?.session };
    } catch (err) {
      showToast("An unexpected error occurred during sign up.", "error");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await apiSignOut();
      if (error) {
        showToast(error.message || "Failed to sign out.", "error");
        return { success: false, error };
      }
      setUser(null);
      showToast("Signed out successfully. Have a creative day!", "success");
      return { success: true };
    } catch (err) {
      showToast("An unexpected error occurred during sign out.", "error");
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
