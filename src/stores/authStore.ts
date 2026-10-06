import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { supabase } from '@/lib/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
}

async function fetchUserProfile(userId: string, email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role, class_id, unit, active')
    .eq('id', userId)
    .single();

  if (error || !data) return null;

  // Ensure active users only
  if (data.active === false) return null;

  return data as User;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      loadSession: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          set({ user: null, isAuthenticated: false });
          return;
        }
        const profile = await fetchUserProfile(session.user.id, session.user.email ?? '');
        if (profile) {
          set({ user: profile, isAuthenticated: true });
        } else {
          // Profile missing — sign out to avoid broken state
          await supabase.auth.signOut();
          set({ user: null, isAuthenticated: false });
        }
      },

      login: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.session) return false;

        const profile = await fetchUserProfile(data.session.user.id, email);
        if (!profile) {
          // Auth succeeded but no profile row — user inactive or not set up
          await supabase.auth.signOut();
          return false;
        }
        set({ user: profile, isAuthenticated: true });
        return true;
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'sesi-auth',
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    }
  )
);
