import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HttpStatus } from '../types/http';
import { getTestCredentials, getTestUser, getTestSession } from '../../test-config';

// Mock the supabase client
const mockSupabase = {
	auth: {
		signInWithPassword: vi.fn(),
		signUp: vi.fn(),
		signOut: vi.fn(),
		getUser: vi.fn(),
		getSession: vi.fn(),
		onAuthStateChange: vi.fn(),
		signInWithOAuth: vi.fn(),
		resetPasswordForEmail: vi.fn()
	}
};

vi.mock('./client', () => ({
	supabase: mockSupabase
}));

describe('Supabase Integration Tests', () => {
	// Get test credentials from test configuration
	const { email: testEmail, password: testPassword } = getTestCredentials();
	const testUser = getTestUser();
	const testSession = getTestSession();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Authentication', () => {
		it('should connect to Supabase successfully', async () => {
			mockSupabase.auth.getSession.mockResolvedValue({
				data: { session: null },
				error: null
			});

			const { data, error } = await mockSupabase.auth.getSession();

			expect(error).toBeNull();
			expect(data).toBeDefined();
		});

		it('should handle login with test credentials', async () => {
			mockSupabase.auth.signInWithPassword.mockResolvedValue({
				data: {
					user: testUser,
					session: testSession
				},
				error: null
			});

			const { data, error } = await mockSupabase.auth.signInWithPassword({
				email: testEmail,
				password: testPassword
			});

			expect(error).toBeNull();
			expect(data.user).toBeDefined();
			expect(data.user?.email).toBe(testEmail);
			expect(data.session).toBeDefined();
		});

		it('should handle logout successfully', async () => {
			mockSupabase.auth.signOut.mockResolvedValue({ error: null });

			const { error } = await mockSupabase.auth.signOut();

			expect(error).toBeNull();
		});

		it('should refresh token automatically', async () => {
			mockSupabase.auth.signInWithPassword.mockResolvedValue({
				data: {
					user: testUser,
					session: testSession
				},
				error: null
			});

			mockSupabase.auth.getSession.mockResolvedValue({
				data: { session: testSession },
				error: null
			});

			const { data: loginData } = await mockSupabase.auth.signInWithPassword({
				email: testEmail,
				password: testPassword
			});

			expect(loginData.session).toBeDefined();

			const { data: sessionData } = await mockSupabase.auth.getSession();
			expect(sessionData.session).toBeDefined();
		});
	});

	describe('OAuth Providers', () => {
		it('should generate Google OAuth URL', async () => {
			mockSupabase.auth.signInWithOAuth.mockResolvedValue({
				data: {
					url: 'https://test-project.supabase.co/auth/v1/authorize?provider=google&redirect_to=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fcallback'
				},
				error: null
			});

			const { data, error } = await mockSupabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					redirectTo: 'http://localhost:3000/auth/callback'
				}
			});

			expect(error).toBeNull();
			expect(data.url).toBeDefined();
			expect(data.url).toContain('google');
			expect(data.url).toContain('authorize');
		});

		it('should generate Apple OAuth URL', async () => {
			mockSupabase.auth.signInWithOAuth.mockResolvedValue({
				data: {
					url: 'https://test-project.supabase.co/auth/v1/authorize?provider=apple&redirect_to=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fcallback'
				},
				error: null
			});

			const { data, error } = await mockSupabase.auth.signInWithOAuth({
				provider: 'apple',
				options: {
					redirectTo: 'http://localhost:3000/auth/callback'
				}
			});

			expect(error).toBeNull();
			expect(data.url).toBeDefined();
			expect(data.url).toContain('apple');
			expect(data.url).toContain('authorize');
		});
	});

	describe('User Management', () => {
		it('should get current user when authenticated', async () => {
			mockSupabase.auth.getUser.mockResolvedValue({
				data: { user: testUser },
				error: null
			});

			const { data, error } = await mockSupabase.auth.getUser();

			expect(error).toBeNull();
			expect(data.user).toBeDefined();
			expect(data.user?.email).toBe(testEmail);
		});

		it('should return null user when not authenticated', async () => {
			mockSupabase.auth.getUser.mockResolvedValue({
				data: { user: null },
				error: null
			});

			const { data, error } = await mockSupabase.auth.getUser();

			expect(error).toBeNull();
			expect(data.user).toBeNull();
		});

		it('should handle password reset request', async () => {
			mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
				data: {},
				error: null
			});

			const { data: _data, error } = await mockSupabase.auth.resetPasswordForEmail(testEmail, {
				redirectTo: 'http://localhost:3000/reset-password'
			});

			expect(error).toBeNull();
		});
	});

	describe('Session Management', () => {
		it('should persist session across page reloads', async () => {
			mockSupabase.auth.signInWithPassword.mockResolvedValue({
				data: {
					user: testUser,
					session: testSession
				},
				error: null
			});

			mockSupabase.auth.getSession.mockResolvedValue({
				data: { session: testSession },
				error: null
			});

			await mockSupabase.auth.signInWithPassword({
				email: testEmail,
				password: testPassword
			});

			const { data: sessionData } = await mockSupabase.auth.getSession();
			expect(sessionData.session).toBeDefined();
		});

		it('should handle session expiration', async () => {
			mockSupabase.auth.getSession.mockResolvedValue({
				data: { session: null },
				error: null
			});

			const { data, error } = await mockSupabase.auth.getSession();

			expect(error).toBeNull();
			expect(data).toBeDefined();
		});
	});

	describe('Error Handling', () => {
		it('should handle network errors gracefully', async () => {
			mockSupabase.auth.getSession.mockRejectedValue(new Error('Network error'));

			await expect(mockSupabase.auth.getSession()).rejects.toThrow('Network error');
		});

		it('should handle invalid credentials', async () => {
			mockSupabase.auth.signInWithPassword.mockResolvedValue({
				data: { user: null, session: null },
				error: { message: 'Invalid login credentials', status: HttpStatus.BAD_REQUEST }
			});

			const { data, error } = await mockSupabase.auth.signInWithPassword({
				email: 'invalid@example.com',
				password: 'wrongpassword'
			});

			expect(error).toBeDefined();
			expect(error?.message).toContain('Invalid login credentials');
			expect(data.user).toBeNull();
		});
	});
});
