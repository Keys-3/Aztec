import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, User, AuthState } from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, username: string, contact: string, role: 'customer' | 'farmer' | 'admin', rememberMe?: boolean) => Promise<{ error: any }>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ error: any }>;
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

  // Initialize authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const userProfile = await fetchUserProfile(firebaseUser.uid);
        if (userProfile) {
          setUser(userProfile);
        } else {
            setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    try {
      const docRef = doc(db, 'user_profiles', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const signUp = async (email: string, password: string, username: string, contact: string, role: 'customer' | 'farmer' | 'admin', rememberMe = false) => {
    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Create user profile in Firestore
      const userProfile: User = {
        id: firebaseUser.uid,
        email,
        username,
        contact,
        role,
        created_at: new Date().toISOString()
      };

      await setDoc(doc(db, 'user_profiles', firebaseUser.uid), userProfile);
      
      setUser(userProfile);
      
      return { error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string, rememberMe = false) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      const userProfile = await fetchUserProfile(firebaseUser.uid);
      if (userProfile) {
        setUser(userProfile);
      } else {
        await firebaseSignOut(auth);
        return { error: { message: 'User profile not found' } };
      }

      return { error: null };
    } catch (error) {
      console.error('SignIn error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      
      // Clear local storage (preserving logic from Supabase version)
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
     // Firebase manages session automatically, so we don't need a heavy manual refresh
     // but we can re-fetch user profile if needed.
     if (auth.currentUser) {
        const userProfile = await fetchUserProfile(auth.currentUser.uid);
        if (userProfile) {
            setUser(userProfile);
        }
     }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return { error: 'Not authenticated' };
    try {
      setLoading(true);
      // Import updateUserProfile from firebase dynamically or add it to imports
      // wait, updateUserProfile is not imported here yet. 
      // I'll just do it via firebase.ts import at top
      
      const { updateUserProfile } = await import('../lib/firebase');
      const success = await updateUserProfile(user.id, updates);
      
      if (success) {
        setUser({ ...user, ...updates });
        return { error: null };
      } else {
        return { error: 'Failed to update profile' };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    refreshSession,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};