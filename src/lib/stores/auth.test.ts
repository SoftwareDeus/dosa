import { describe, it, expect, beforeEach, vi } from 'vitest';
const EXPIRES_IN_SECONDS = 3600;
import { get } from 'svelte/store';

// Mock the supabase client
vi.mock('$lib/supabase/client', () => ({
	supabase: {
		auth: {
			getSession: vi.fn(),
			getUser: vi.fn(),
			signOut: vi.fn(),
			onAuthStateChange: vi.fn()
		}
	}
}));

// Import after mocking
import { authStore, initializeAuth, setupAuthListener, signOut } from './auth';

describe('Auth Store Tests', () => {
	let mockSupabase: unknown;

	beforeEach(async () => {
		vi.clearAllMocks();

		// Get the mocked supabase
		const { supabase } = await import('$lib/supabase/client');
		mockSupabase = supabase;

		// Reset store to initial state
		authStore.set({
			user: null,
			session: null,
			loading: true
		});
	});

	describe('Initial State', () => {
		it('should have correct initial state', () => {
			const state = get(authStore);
			expect(state.user).toBeNull();
			expect(state.session).toBeNull();
			expect(state.loading).toBe(true);
		});
	});

	describe('initializeAuth', () => {
		it('should initialize auth with valid session', async () => {
			const mockUser = { id: '123', email: 'test@example.com' };
			const mockSession = { access_token: 'token' };

			mockSupabase.auth.getSession.mockResolvedValue({
				data: { session: mockSession }
			});
			mockSupabase.auth.getUser.mockResolvedValue({
				data: { user: mockUser }
			});

			await initializeAuth();

			const state = get(authStore);
			expect(state.user).toEqual(mockUser);
			expect(state.session).toEqual(mockSession);
			expect(state.loading).toBe(false);
		});
	});

	describe('setupAuthListener', () => {
		it('should setup auth state change listener', () => {
			setupAuthListener();
			expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled();
		});
	});

	describe('signOut', () => {
		it('should sign out successfully', async () => {
			mockSupabase.auth.signOut.mockResolvedValue({ error: null });

			await signOut();

			expect(mockSupabase.auth.signOut).toHaveBeenCalled();

			const state = get(authStore);
			expect(state.user).toBeNull();
			expect(state.session).toBeNull();
			expect(state.loading).toBe(false);
		});

		it('should handle sign out error', async () => {
			mockSupabase.auth.signOut.mockRejectedValue(new Error('Sign out failed'));

			await expect(signOut()).rejects.toThrow('Sign out failed');
		});
	});

	describe('Store Updates', () => {
		it('should update store when user signs in', () => {
			const mockUser = {
				id: '123',
				email: 'test@example.com',
				app_metadata: {},
				user_metadata: {},
				aud: 'authenticated',
				created_at: '2023-01-01T00:00:00.000Z'
			};
			const mockSession = {
				access_token: 'token',
				refresh_token: 'refresh_token',
				expires_in: EXPIRES_IN_SECONDS,
				token_type: 'bearer',
				user: mockUser
			};

			authStore.set({
				user: mockUser,
				session: mockSession,
				loading: false
			});

			const state = get(authStore);
			expect(state.user).toEqual(mockUser);
			expect(state.session).toEqual(mockSession);
			expect(state.loading).toBe(false);
		});

		it('should update store when user signs out', () => {
			authStore.set({
				user: null,
				session: null,
				loading: false
			});

			const state = get(authStore);
			expect(state.user).toBeNull();
			expect(state.session).toBeNull();
			expect(state.loading).toBe(false);
		});
	});
});
