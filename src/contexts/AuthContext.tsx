import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, User, AuthState } from '../lib/supabase';

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, username: string, contact: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle auto logout when tab/window is closed
    const handleBeforeUnload = () => {
      const rememberMe = localStorage.getItem('aztec-remember-me') === 'true';
      if (!rememberMe) {
        // Clear session if user doesn't want to be remembered
        supabase.auth.signOut();
        localStorage.removeItem('aztec-remember-me');
      }
    };

    // Handle visibility change (tab switching, minimizing)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const rememberMe = localStorage.getItem('aztec-remember-me') === 'true';
        if (!rememberMe) {
          // Set a timestamp when the tab becomes hidden
          localStorage.setItem('aztec-hidden-timestamp', Date.now().toString());
        }
      } else if (document.visibilityState === 'visible') {
        const rememberMe = localStorage.getItem('aztec-remember-me') === 'true';
        const hiddenTimestamp = localStorage.getItem('aztec-hidden-timestamp');
        
        if (!rememberMe && hiddenTimestamp) {
          const hiddenTime = Date.now() - parseInt(hiddenTimestamp);
          // Auto logout if tab was hidden for more than 30 minutes (1800000 ms)
          if (hiddenTime > 1800000) {
            supabase.auth.signOut();
            localStorage.removeItem('aztec-hidden-timestamp');
          }
        }
        
        localStorage.removeItem('aztec-hidden-timestamp');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        // Clear remember me flag when user is logged out
        localStorage.removeItem('aztec-remember-me');
        localStorage.removeItem('aztec-hidden-timestamp');
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // If no profile exists, set user to null instead of throwing error
        if (error.code === 'PGRST116') {
          setUser(null);
          return;
        }
        throw error;
      }

      setUser(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string, contact: string, rememberMe = false) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) return { error };

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([
            {
              id: data.user.id,
              email,
              username,
              contact,
            }
          ]);

        if (profileError) return { error: profileError };

        // Set remember me preference
        localStorage.setItem('aztec-remember-me', rememberMe.toString());
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string, rememberMe = false) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error) {
        // Set remember me preference
        localStorage.setItem('aztec-remember-me', rememberMe.toString());
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('aztec-remember-me');
    localStorage.removeItem('aztec-hidden-timestamp');
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
};