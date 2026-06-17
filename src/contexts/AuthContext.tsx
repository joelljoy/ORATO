'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange, signOut, signInWithGoogle, signInWithEmail, signUpWithEmail } from '@/lib/firebase/auth';
import { getUserProfile } from '@/lib/firebase/firestore';
import { UserProfile } from '@/types/user';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInGoogle: () => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        if (typeof window !== 'undefined') {
          document.cookie = `orato-auth=true; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        }
        const userProfile = await getUserProfile(firebaseUser.uid);
        setProfile(userProfile);
      } else {
        if (typeof window !== 'undefined') {
          document.cookie = 'orato-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
        }
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInGoogle = async () => {
    await signInWithGoogle();
  };

  const signInEmail = async (email: string, password: string) => {
    await signInWithEmail(email, password);
  };

  const signUpEmail = async (email: string, password: string, name: string) => {
    await signUpWithEmail(email, password, name);
  };

  const logout = async () => {
    await signOut();
    if (typeof window !== 'undefined') {
      document.cookie = 'orato-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    }
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInGoogle, signInEmail, signUpEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
