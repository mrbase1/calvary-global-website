import React, { createContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase';
import { Database } from '../types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          setUser(session?.user ?? null);
          
          if (session?.user) {
            const profile = await fetchProfile(session.user.id);
            setProfile(profile);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        if (mounted) {
          setUser(session?.user ?? null);
          
          if (session?.user) {
            const profile = await fetchProfile(session.user.id);
            setProfile(profile);
          } else {
            setProfile(null);
          }
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Current session:', session);
        
        // If no session but we have user/profile state, clear everything
        if (!session && (user || profile)) {
          console.log('Inconsistent state detected, clearing...');
          await signOut();
        }
      } catch (error) {
        console.error('Session verification error:', error);
      }
    };

    verifySession();
  }, [user, profile]);

  useEffect(() => {
    let inactivityTimeout: NodeJS.Timeout;
    const INACTIVE_TIMEOUT = 12 * 60 * 60 * 1000; // 12 hours
    const SESSION_CHECK_INTERVAL = 5 * 60 * 1000;  // 5 minutes

    const checkSessionAge = () => {
      const sessionStr = localStorage.getItem('sb-dbptiywmhdputtdlwaah-auth-token');
      if (sessionStr && user) {
        const session = JSON.parse(sessionStr);
        const createdAt = new Date(session.created_at).getTime();
        const now = new Date().getTime();
        
        if (now - createdAt >= INACTIVE_TIMEOUT) {
          console.log('Session expired due to age');
          signOut();
          toast.info('Your session has expired. Please log in again.');
          return true;
        }
      }
      return false;
    };

    const resetInactivityTimer = () => {
      if (inactivityTimeout) {
        clearTimeout(inactivityTimeout);
      }
      
      if (user && !checkSessionAge()) {
        inactivityTimeout = setTimeout(() => {
          console.log('Session expired due to inactivity');
          signOut();
          toast.info('You have been logged out due to inactivity');
        }, INACTIVE_TIMEOUT);
      }
    };

    // Track user activity
    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll', 'mousemove'];
    const handleActivity = () => resetInactivityTimer();
    
    // Add visibility change detection
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        checkSessionAge();
      }
    };

    // Set up event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Periodic session check
    const sessionCheckInterval = setInterval(checkSessionAge, SESSION_CHECK_INTERVAL);

    // Initial setup
    resetInactivityTimer();

    // Cleanup
    return () => {
      if (inactivityTimeout) {
        clearTimeout(inactivityTimeout);
      }
      clearInterval(sessionCheckInterval);
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.expires_at) {
        const expiryTime = new Date(session.expires_at * 1000);
        const now = new Date();
        
        if (expiryTime <= now) {
          signOut();
          toast.info('Your session has expired. Please log in again.');
        }
      }
    };

    // Check every 5 minutes
    const intervalId = setInterval(checkSession, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Clear Supabase session
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear all auth states
      setUser(null);
      setProfile(null);

      // Clear any stored session data
      window.localStorage.removeItem('sb-dbptiywmhdputtdlwaah-auth-token');
      
      // Force reload to clear any lingering state
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out properly');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Removed useAuth function. Import it from the hooks folder instead.

