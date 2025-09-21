import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

// Ensure we only have one auth listener
let authListenerInitialized = false;

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

// Initialize auth state (only run once)
let authInitialized = false;

export async function initializeAuth() {
  if (authInitialized) {
    console.log('Auth already initialized, skipping...');
    return;
  }
  
  authInitialized = true;
  console.log('Initializing auth...');
  
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
    
    console.log('Auth initialized successfully, user:', user ? user.email : 'none');
  } catch (error) {
    console.error('Auth initialization error:', error);
    authStore.set({
      user: null,
      session: null,
      loading: false
    });
  }
}

// Listen to auth changes (only initialize once)
export function setupAuthListener() {
  if (authListenerInitialized) {
    console.log('Auth listener already initialized, skipping...');
    return;
  }
  
  authListenerInitialized = true;
  console.log('Setting up auth listener...');
  
  supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state change:', event, 'Session:', session ? 'exists' : 'null');
    
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      // Verify user with server for security
      const { data: { user } } = await supabase.auth.getUser();
      console.log('User signed in:', user ? user.email : 'none');
      authStore.set({
        user: user,
        session: session,
        loading: false
      });
    } else if (event === 'SIGNED_OUT') {
      console.log('User signed out, clearing store');
      authStore.set({
        user: null,
        session: null,
        loading: false
      });
    } else if (event === 'INITIAL_SESSION') {
      // Handle initial session
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Initial session, user:', user ? user.email : 'none');
      authStore.set({
        user: user,
        session: session,
        loading: false
      });
    }
  });
}

// Helper functions
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Supabase signOut error:', error);
      throw error;
    }
    
    // Update store immediately
    authStore.set({
      user: null,
      session: null,
      loading: false
    });
    
    console.log('User signed out successfully');
  } catch (error) {
    console.error('SignOut error:', error);
    throw error;
  }
}
