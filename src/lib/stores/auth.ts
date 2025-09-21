import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  session: null,
  loading: true
};

export const authStore = writable<AuthState>(initialState);

// Initialize auth state
export async function initializeAuth() {
  try {
    // Get initial session
    const { data: { session } } = await supabase.auth.getSession();
    
    // Verify user with server
    const { data: { user } } = await supabase.auth.getUser();
    
    authStore.set({
      user: user,
      session: session,
      loading: false
    });
  } catch (error) {
    console.error('Auth initialization error:', error);
    authStore.set({
      user: null,
      session: null,
      loading: false
    });
  }
}

// Listen to auth changes
export function setupAuthListener() {
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      // Verify user with server for security
      const { data: { user } } = await supabase.auth.getUser();
      authStore.set({
        user: user,
        session: session,
        loading: false
      });
    } else if (event === 'SIGNED_OUT') {
      authStore.set({
        user: null,
        session: null,
        loading: false
      });
    }
  });
}

// Helper functions
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
