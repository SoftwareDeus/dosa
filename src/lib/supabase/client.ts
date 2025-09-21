import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// Create a single Supabase client instance to avoid multiple instances warning
export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
  auth: {
    // Use localStorage for client-side auth persistence
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    // Auto refresh tokens
    autoRefreshToken: true,
    // Persist session across browser tabs
    persistSession: true,
    // Detect session in URL
    detectSessionInUrl: true
  }
});
