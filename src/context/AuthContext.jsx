import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getUser as apiGetUser, 
  signIn as apiSignIn, 
  signUp as apiSignUp, 
  signOut as apiSignOut 
} from '../lib/supabase';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Load user session on mount
  useEffect(() => {
    async function loadSession() {
      try {
        const { data, error } = await apiGetUser();
        if (data?.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.error("Error loading user session:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await apiSignIn(email, password);
      if (error) {
        showToast(error.message || "Failed to sign in.", "error");
        return { success: false, error };
      }
      setUser(data.user);
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
      // If we got a user back (or auto-logged in)
      if (data?.user) {
        setUser(data.user);
      }
      showToast("Account created successfully! Welcome to MuseHaus.", "success");
      return { success: true };
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
