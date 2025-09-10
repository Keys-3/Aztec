import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, User, AuthState } from '../lib/supabase';

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, username: string, contact: string, rememberMe?: boolean) => Promise<{ error: any }>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: any }>;
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
    // Handle auto logout when page is closed/reloaded
    const handleBeforeUnload = () => {
      const rememberMe = localStorage.getItem('aztec-remember-me') === 'true';
      if (!rememberMe) {
        // Clear session immediately if user doesn't want to be remembered
        supabase.auth.signOut();
        localStorage.removeItem('aztec-remember-me');
        localStorage.removeItem('aztec-hidden-timestamp');
        localStorage.removeItem('aztec-cart');
        localStorage.removeItem('aztec-selling');
      }
    };

    // Handle page visibility changes (tab switching, minimizing, etc.)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const rememberMe = localStorage.getItem('aztec-remember-me') === 'true';
        if (!rememberMe) {
          // Set timestamp when tab becomes hidden for non-remembered users
          localStorage.setItem('aztec-hidden-timestamp', Date.now().toString());
        }
      } else if (document.visibilityState === 'visible') {
        const rememberMe = localStorage.getItem('aztec-remember-me') === 'true';
        const hiddenTimestamp = localStorage.getItem('aztec-hidden-timestamp');
        
        if (!rememberMe && hiddenTimestamp) {
          const hiddenTime = Date.now() - parseInt(hiddenTimestamp);
          // Auto logout if tab was hidden for more than 15 minutes (900000 ms)
          if (hiddenTime > 900000) {
            supabase.auth.signOut();
            localStorage.removeItem('aztec-hidden-timestamp');
            localStorage.removeItem('aztec-remember-me');
            localStorage.removeItem('aztec-cart');
            localStorage.removeItem('aztec-selling');
          }
        }
        
        localStorage.removeItem('aztec-hidden-timestamp');
      }
    };

    // Handle page unload (refresh, navigation, close)
    const handleUnload = () => {
      const rememberMe = localStorage.getItem('aztec-remember-me') === 'true';
      if (!rememberMe) {
        // Clear all session data for non-remembered users
        localStorage.removeItem('aztec-remember-me');
        localStorage.removeItem('aztec-hidden-timestamp');
        localStorage.removeItem('aztec-cart');
        localStorage.removeItem('aztec-selling');
        // Note: supabase.auth.signOut() might not complete during unload
        // but the session will be cleared on next load due to missing localStorage flags
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Check for existing session on app load
    supabase.auth.getSession().then(({ data: { session } }) => {
      const rememberMe = localStorage.getItem('aztec-remember-me') === 'true';
      
      if (session?.user && rememberMe) {
        // User has valid session and wants to be remembered
        fetchUserProfile(session.user.id);
      } else if (session?.user && !rememberMe) {
        // User has session but doesn't want to be remembered - sign them out
        supabase.auth.signOut();
        setLoading(false);
      } else {
        // No session found
        setLoading(false);
      }
    });

    // Listen for authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const rememberMe = localStorage.getItem('aztec-remember-me') === 'true';
        if (rememberMe) {
          await fetchUserProfile(session.user.id);
        } else {
          // If not remembering, still fetch profile but set up for auto-logout
          await fetchUserProfile(session.user.id);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        // Clear all session-related data
        localStorage.removeItem('aztec-remember-me');
        localStorage.removeItem('aztec-hidden-timestamp');
        setLoading(false);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
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
        // If no profile exists, user might be in auth but not in our user_profiles table
        if (error.code === 'PGRST116') {
          console.warn('User authenticated but no profile found');
          setUser(null);
          // Sign out the user since they don't have a complete profile
          await supabase.auth.signOut();
          return;
        }
        throw error;
      }

      setUser(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUser(null);
      // Sign out on profile fetch error
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string, contact: string, rememberMe = false) => {
    try {
      // Set remember preference before signup
      localStorage.setItem('aztec-remember-me', rememberMe.toString());
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) return { error };

      if (data.user) {
        // Create user profile in our custom table
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

        if (profileError) {
          // If profile creation fails, clean up the auth user
          await supabase.auth.signOut();
          localStorage.removeItem('aztec-remember-me');
          return { error: profileError };
        }
      }

      return { error: null };
    } catch (error) {
      localStorage.removeItem('aztec-remember-me');
      return { error };
    }
  };

  const signIn = async (email: string, password: string, rememberMe = false) => {
    try {
      // Set remember preference before signin
      localStorage.setItem('aztec-remember-me', rememberMe.toString());
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Clear remember preference on signin error
        localStorage.removeItem('aztec-remember-me');
      }

      return { error };
    } catch (error) {
      localStorage.removeItem('aztec-remember-me');
      return { error };
    }
  };

  const signOut = async () => {
    // Clear all local storage data
    localStorage.removeItem('aztec-remember-me');
    localStorage.removeItem('aztec-hidden-timestamp');
    localStorage.removeItem('aztec-cart');
    localStorage.removeItem('aztec-selling');
    
    // Sign out from Supabase
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
};