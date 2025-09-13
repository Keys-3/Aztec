import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, User, AuthState, AuthSession, generateSessionToken, getSessionExpiry, getDeviceInfo, getUserInventory, getUserShopListings } from '../lib/supabase';
import { useCart } from './CartContext';

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, username: string, contact: string, rememberMe?: boolean) => Promise<{ error: any }>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  loadUserInventoryData: () => Promise<void>;
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
  const [sessionCheckComplete, setSessionCheckComplete] = useState(false);
  const [cartContext, setCartContext] = useState<any>(null);

  // Get cart context after it's available
  useEffect(() => {
    // This is a workaround to avoid circular dependency
    // We'll call loadUserData from the component level instead
  }, []);

  // Cleanup expired sessions
  const cleanupExpiredSessions = async () => {
    try {
      const { error } = await supabase
        .from('auth_sessions')
        .delete()
        .lt('expires_at', new Date().toISOString());
      
      if (error) {
        console.warn('Failed to cleanup expired sessions:', error);
      }
    } catch (error) {
      console.warn('Error during session cleanup:', error);
    }
  };

  // Create or update session in database
  const createSession = async (userId: string, rememberMe: boolean) => {
    try {
      const sessionToken = generateSessionToken();
      const expiresAt = getSessionExpiry(rememberMe);
      const deviceInfo = getDeviceInfo();

      const { error } = await supabase
        .from('auth_sessions')
        .insert([{
          user_id: userId,
          session_token: sessionToken,
          expires_at: expiresAt,
          remember_me: rememberMe,
          device_info: deviceInfo
        }]);

      if (error) {
        console.error('Failed to create session:', error);
        return null;
      }

      // Store session token locally
      if (rememberMe) {
        localStorage.setItem('aztec-session-token', sessionToken);
        localStorage.setItem('aztec-remember-me', 'true');
      } else {
        sessionStorage.setItem('aztec-session-token', sessionToken);
        localStorage.setItem('aztec-remember-me', 'false');
      }

      return sessionToken;
    } catch (error) {
      console.error('Error creating session:', error);
      return null;
    }
  };

  // Validate session from database
  const validateSession = async (sessionToken: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('auth_sessions')
        .select(`
          *,
          user_profiles (*)
        `)
        .eq('session_token', sessionToken)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        return null;
      }

      // Update last activity
      await supabase
        .from('auth_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('session_token', sessionToken);

      return data.user_profiles as User;
    } catch (error) {
      console.error('Error validating session:', error);
      return null;
    }
  };

  // Clear all sessions for user
  const clearUserSessions = async (userId?: string) => {
    if (!userId && !user) return;
    
    try {
      await supabase
        .from('auth_sessions')
        .delete()
        .eq('user_id', userId || user!.id);
    } catch (error) {
      console.error('Error clearing user sessions:', error);
    }
  };

  // Initialize authentication state
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn('Auth initialization timeout - setting loading to false');
            setLoading(false);
            setSessionCheckComplete(true);
          }
        }, 10000); // 10 second timeout

        // Cleanup expired sessions first
        await cleanupExpiredSessions();

        // Check for existing session token
        const sessionToken = localStorage.getItem('aztec-session-token') || 
                            sessionStorage.getItem('aztec-session-token');

        if (sessionToken) {
          // Validate session from database
          const validatedUser = await validateSession(sessionToken);
          
          if (validatedUser && mounted) {
            setUser(validatedUser);
          } else {
            // Invalid session, clear tokens
            localStorage.removeItem('aztec-session-token');
            sessionStorage.removeItem('aztec-session-token');
            localStorage.removeItem('aztec-remember-me');
          }
        } else {
          // Check Supabase auth session as fallback
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user && mounted) {
            // Fetch user profile
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              setUser(profile);
              // Create new session in database
              await createSession(profile.id, false);
            }
          }
        }

        if (mounted) {
          clearTimeout(timeoutId);
          setLoading(false);
          setSessionCheckComplete(true);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          clearTimeout(timeoutId);
          setLoading(false);
          setSessionCheckComplete(true);
        }
      }
    };

    initializeAuth();

    // Listen for Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted || !sessionCheckComplete) return;

      if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('aztec-session-token');
        sessionStorage.removeItem('aztec-session-token');
        localStorage.removeItem('aztec-remember-me');
        localStorage.removeItem('aztec-cart');
        localStorage.removeItem('aztec-selling');
      }
    });

    // Handle page visibility changes for session management
    const handleVisibilityChange = async () => {
      if (!mounted || !sessionCheckComplete) return;

      if (document.visibilityState === 'visible' && user) {
        // Refresh session when page becomes visible
        await refreshSession();
      }
    };

    // Handle page unload
    const handleBeforeUnload = () => {
      const rememberMe = localStorage.getItem('aztec-remember-me') === 'true';
      if (!rememberMe) {
        // Clear session storage for non-remembered sessions
        sessionStorage.removeItem('aztec-session-token');
        localStorage.removeItem('aztec-cart');
        localStorage.removeItem('aztec-selling');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const signUp = async (email: string, password: string, username: string, contact: string, rememberMe = false) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) return { error };

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([{
            id: data.user.id,
            email,
            username,
            contact,
          }]);

        if (profileError) {
          await supabase.auth.signOut();
          return { error: profileError };
        }

        // Fetch the created profile
        const userProfile = await fetchUserProfile(data.user.id);
        if (userProfile) {
          setUser(userProfile);
          await createSession(userProfile.id, rememberMe);
        }
      }

      return { error: null };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string, rememberMe = false) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error };

      if (data.user) {
        const userProfile = await fetchUserProfile(data.user.id);
        if (userProfile) {
          setUser(userProfile);
          await createSession(userProfile.id, rememberMe);
        } else {
          await supabase.auth.signOut();
          return { error: { message: 'User profile not found' } };
        }
      }

      return { error: null };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);

      // Clear user sessions from database
      if (user) {
        await clearUserSessions(user.id);
      }

      // Sign out from Supabase
      await supabase.auth.signOut();

      // Clear local storage
      localStorage.removeItem('aztec-session-token');
      sessionStorage.removeItem('aztec-session-token');
      localStorage.removeItem('aztec-remember-me');
      localStorage.removeItem('aztec-cart');
      localStorage.removeItem('aztec-selling');

      setUser(null);
    } catch (error) {
      console.error('Error during sign out:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    if (!user) return;

    try {
      const sessionToken = localStorage.getItem('aztec-session-token') || 
                          sessionStorage.getItem('aztec-session-token');

      if (sessionToken) {
        const validatedUser = await validateSession(sessionToken);
        if (!validatedUser) {
          // Session expired or invalid, sign out
          await signOut();
        }
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      await signOut();
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};