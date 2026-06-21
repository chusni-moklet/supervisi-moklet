'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { type User, type Role, type Permission, ROLE_PERMISSIONS } from './types';
import { supabase } from './supabase';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: Role) => void;
  hasPermission: (permission: Permission) => boolean;
  isInitializing: boolean;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function handleSession(session: any) {
      if (!session) {
        if (mounted) {
          setCurrentUser(null);
          setIsInitializing(false);
        }
        return;
      }

      const email = session.user.email;
      
      // Domain restriction
      if (!email?.endsWith('@smktelkom-mlg.sch.id')) {
        await supabase.auth.signOut();
        if (mounted) {
          setAuthError('Gunakan email sekolah Anda (@smktelkom-mlg.sch.id).');
          setCurrentUser(null);
          setIsInitializing(false);
        }
        return;
      }

      // Whitelist restriction & Auto-Register
      let { data: users } = await supabase.from('users').select('*').eq('email', email);
      
      if (!users || users.length === 0) {
        // Auto-register user baru sebagai ADMIN
        const newUserName = session.user.user_metadata?.full_name || email.split('@')[0];
        const { data: newUser, error: insertError } = await supabase.from('users').insert([{
          email: email,
          name: newUserName,
          role: 'ADMIN'
        }]).select();

        if (insertError || !newUser || newUser.length === 0) {
          await supabase.auth.signOut();
          if (mounted) {
            setAuthError('Gagal membuat akun otomatis. Hubungi Admin.');
            setCurrentUser(null);
            setIsInitializing(false);
          }
          return;
        }
        users = newUser;
      }

      if (mounted) {
        setCurrentUser(users[0] as User);
        setAuthError(null);
        setIsInitializing(false);
      }
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) {
      setAuthError(error.message);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const switchRole = useCallback(async (role: Role) => {
    if (!currentUser) return;
    const { data: users } = await supabase.from('users').select('*').eq('role', role).limit(1);
    if (users && users.length > 0) {
      setCurrentUser(users[0] as User);
    } else {
      setCurrentUser({ ...currentUser, role });
    }
  }, [currentUser]);

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!currentUser) return false;
      return ROLE_PERMISSIONS[currentUser.role].includes(permission);
    },
    [currentUser],
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: currentUser !== null,
        loginWithGoogle,
        logout,
        switchRole,
        hasPermission,
        isInitializing,
        authError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
