import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // 1. Check if there's a guest session in local storage first
    const guestSession = localStorage.getItem('animatch_guest_user');
    if (guestSession) {
      try {
        const guestData = JSON.parse(guestSession);
        setUser(guestData.user);
        setProfile(guestData.profile);
        setIsGuest(true);
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('animatch_guest_user');
      }
    }

    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      // If guest session is active, don't let Supabase clear it
      if (localStorage.getItem('animatch_guest_user')) return;

      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setIsGuest(false);
      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // If profile doesn't exist, we can create one as a fallback
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{ id: userId, username: `Otaku_${userId.slice(0, 6)}` }])
            .select()
            .single();
          
          if (!createError && newProfile) {
            setProfile(newProfile);
          }
        } else {
          console.error('Error fetching profile:', error.message);
        }
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error in fetchProfile:', err);
    } finally {
      setLoading(false);
    }
  }

  async function updateUsername(newUsername: string) {
    if (!user) return;
    if (isGuest || localStorage.getItem('animatch_guest_user')) {
      const updatedProfile = profile ? { ...profile, username: newUsername } : null;
      setProfile(updatedProfile);
      localStorage.setItem(
        'animatch_guest_user',
        JSON.stringify({ user, profile: updatedProfile })
      );
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: newUsername })
        .eq('id', user.id);

      if (error) throw error;
      setProfile((prev) => prev ? { ...prev, username: newUsername } : null);
    } catch (err: any) {
      console.error('Failed to update username:', err.message);
      throw err;
    }
  }

  function signInAsGuest() {
    setLoading(true);
    const guestId = 'guest_' + Math.random().toString(36).substr(2, 9);
    const guestUser = {
      id: guestId,
      email: 'guest@animatch.com',
      user_metadata: { username: 'Otaku Guest' }
    } as unknown as User;

    const guestProfile: UserProfile = {
      id: guestId,
      username: 'Otaku Guest',
      avatar_url: null,
      created_at: new Date().toISOString()
    };

    localStorage.setItem(
      'animatch_guest_user',
      JSON.stringify({ user: guestUser, profile: guestProfile })
    );
    setUser(guestUser);
    setProfile(guestProfile);
    setIsGuest(true);
    setLoading(false);
  }

  function signOut() {
    if (isGuest || localStorage.getItem('animatch_guest_user')) {
      localStorage.removeItem('animatch_guest_user');
      setUser(null);
      setProfile(null);
      setIsGuest(false);
      return Promise.resolve();
    }
    return supabase.auth.signOut();
  }

  return {
    user,
    profile,
    loading,
    isGuest,
    updateUsername,
    signInAsGuest,
    signOut
  };
}
