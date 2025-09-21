import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase/client';
import { logger } from '$lib/logger';
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
		logger.debug('Auth already initialized, skipping...');
		return;
	}

	authInitialized = true;
	logger.auth('Initializing auth...');

	try {
		// Get initial session
		const {
			data: { session }
		} = await supabase.auth.getSession();

		// Verify user with server
		const {
			data: { user }
		} = await supabase.auth.getUser();

		authStore.set({
			user: user,
			session: session,
			loading: false
		});

		logger.auth('Auth initialized successfully', { email: user?.email });
	} catch (error) {
		logger.error('Auth initialization error', {
			error: error instanceof Error ? error.message : String(error)
		});
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
		logger.auth('Auth listener already initialized, skipping...');
		return;
	}

	authListenerInitialized = true;
	logger.auth('Setting up auth listener...');

	supabase.auth.onAuthStateChange(async (event, session) => {
		logger.auth('Auth state change', { event, hasSession: !!session });

		if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
			// Verify user with server for security
			const {
				data: { user }
			} = await supabase.auth.getUser();
			logger.auth('User signed in', { email: user?.email });
			authStore.set({
				user: user,
				session: session,
				loading: false
			});
		} else if (event === 'SIGNED_OUT') {
			logger.auth('User signed out, clearing store');
			authStore.set({
				user: null,
				session: null,
				loading: false
			});
		} else if (event === 'INITIAL_SESSION') {
			// Handle initial session
			const {
				data: { user }
			} = await supabase.auth.getUser();
			logger.auth('Initial session', { email: user?.email });
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
			logger.error('Supabase signOut error', { error: error.message });
			throw error;
		}

		// Update store immediately
		authStore.set({
			user: null,
			session: null,
			loading: false
		});

		logger.auth('User signed out successfully');
	} catch (error) {
		logger.error('SignOut error', {
			error: error instanceof Error ? error.message : String(error)
		});
		throw error;
	}
}
