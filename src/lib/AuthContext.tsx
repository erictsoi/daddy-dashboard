import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { INITIAL_DATA } from '../../constants'

export type UserRole = 'daddy' | 'child' | 'guest'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  userRole: UserRole
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<UserRole>('guest')

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      const hash = window.location.hash;
      
      // Parse OAuth callback
      if (hash.includes('access_token')) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        
        if (accessToken) {
          // Manually set the session from OAuth callback
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          
          // Clear URL
          window.history.replaceState(null, '', window.location.pathname);
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      console.log('AuthContext: Session:', session?.user?.email || 'none');
      
      if (session) {
        setSession(session);
        setUser(session.user);
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('AuthContext: onAuthStateChange:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
      });

      setTimeout(() => {
        setLoading(false);
      }, 1000);

      return () => subscription.unsubscribe();
    };

    initAuth();
  }, []);

  const signInWithGoogle = async () => {
    if (!supabase) {
      console.warn('Supabase not configured');
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
  }

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    setUserRole('guest')
    setUserRole('guest')
    // Reset localStorage to default data for next user
    localStorage.setItem('daddy_dashboard_data', JSON.stringify(INITIAL_DATA))
    // Reload page to reset all React state
    window.location.reload()
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, userRole, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
