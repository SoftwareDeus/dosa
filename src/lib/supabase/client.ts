import { createClient } from '@supabase/supabase-js';
import { env as dynamic } from '$env/dynamic/public';
import { PUBLIC_SUPABASE_URL as STATIC_URL, PUBLIC_SUPABASE_ANON_KEY as STATIC_KEY } from '$env/static/public';

// Create a single Supabase client instance to avoid multiple instances warning
const url = dynamic.PUBLIC_SUPABASE_URL || STATIC_URL;
const anon = dynamic.PUBLIC_SUPABASE_ANON_KEY || STATIC_KEY;

export const supabase = createClient(url, anon, {
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
