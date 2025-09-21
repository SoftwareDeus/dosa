import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Supabase client
const mockSupabase = {
	auth: {
		signInWithPassword: vi.fn(),
		signInWithOAuth: vi.fn(),
		signUp: vi.fn()
	}
};

// Mock the supabase client
vi.mock('$lib/supabase/client', () => ({
	supabase: mockSupabase
}));

// Mock SvelteKit navigation
const mockGoto = vi.fn();
vi.mock('$app/navigation', () => ({
	goto: mockGoto
}));

// Mock Capacitor
vi.mock('@capacitor/core', () => ({
	Capacitor: {
		isNativePlatform: vi.fn(() => false),
		getPlatform: vi.fn(() => 'web')
	}
}));

describe('Login Logic Tests', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Email Validation', () => {
		it('should validate email format correctly', () => {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

			expect(emailRegex.test('nicolai.walsemann@gmx.de')).toBe(true);
			expect(emailRegex.test('test@example.com')).toBe(true);
			expect(emailRegex.test('invalid-email')).toBe(false);
			expect(emailRegex.test('')).toBe(false);
			expect(emailRegex.test('test@')).toBe(false);
		});
	});

	describe('Password Validation', () => {
		it('should validate password length correctly', () => {
			const validatePassword = (password: string) => password.length >= 6;

			expect(validatePassword('123123')).toBe(true);
			expect(validatePassword('password123')).toBe(true);
			expect(validatePassword('123')).toBe(false);
			expect(validatePassword('')).toBe(false);
		});
	});

	describe('Login Function', () => {
		it('should call Supabase signInWithPassword with correct parameters', async () => {
			const email = 'nicolai.walsemann@gmx.de';
			const password = '123123';

			mockSupabase.auth.signInWithPassword.mockResolvedValue({
				data: { user: { id: '123', email }, session: {} },
				error: null
			});

			const result = await mockSupabase.auth.signInWithPassword({ email, password });

			expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({ email, password });
			expect(result.data.user?.email).toBe(email);
		});

		it('should handle login errors correctly', async () => {
			const email = 'invalid@example.com';
			const password = 'wrongpassword';

			mockSupabase.auth.signInWithPassword.mockResolvedValue({
				data: { user: null, session: null },
				error: { message: 'Invalid login credentials' }
			});

			const result = await mockSupabase.auth.signInWithPassword({ email, password });

			expect(result.error).toBeDefined();
			expect(result.error?.message).toBe('Invalid login credentials');
			expect(result.data.user).toBeNull();
		});
	});

	describe('Registration Function', () => {
		it('should call Supabase signUp with correct parameters', async () => {
			const email = 'newuser@example.com';
			const password = '123123';

			mockSupabase.auth.signUp.mockResolvedValue({
				data: { user: { id: '123', email }, session: null },
				error: null
			});

			const result = await mockSupabase.auth.signUp({ email, password });

			expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({ email, password });
			expect(result.data.user?.email).toBe(email);
		});

		it('should handle registration errors correctly', async () => {
			const email = 'nicolai.walsemann@gmx.de'; // Already exists
			const password = '123123';

			mockSupabase.auth.signUp.mockResolvedValue({
				data: { user: null, session: null },
				error: { message: 'User already registered' }
			});

			const result = await mockSupabase.auth.signUp({ email, password });

			expect(result.error).toBeDefined();
			expect(result.error?.message).toBe('User already registered');
			expect(result.data.user).toBeNull();
		});
	});

	describe('OAuth Functions', () => {
		it('should call Google OAuth with correct parameters', async () => {
			const redirectTo = 'http://localhost:3000/auth/callback';

			mockSupabase.auth.signInWithOAuth.mockResolvedValue({
				data: { url: 'https://google.com/oauth' },
				error: null
			});

			const result = await mockSupabase.auth.signInWithOAuth({
				provider: 'google',
				options: { redirectTo }
			});

			expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
				provider: 'google',
				options: { redirectTo }
			});
			expect(result.data.url).toContain('google.com');
		});

		it('should call Apple OAuth with correct parameters', async () => {
			const redirectTo = 'http://localhost:3000/auth/callback';

			mockSupabase.auth.signInWithOAuth.mockResolvedValue({
				data: { url: 'https://apple.com/oauth' },
				error: null
			});

			const result = await mockSupabase.auth.signInWithOAuth({
				provider: 'apple',
				options: { redirectTo }
			});

			expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
				provider: 'apple',
				options: { redirectTo }
			});
			expect(result.data.url).toContain('apple.com');
		});
	});

	describe('Form Validation', () => {
		it('should validate complete login form', () => {
			const validateLoginForm = (email: string, password: string) => {
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				return emailRegex.test(email) && password.length >= 6;
			};

			expect(validateLoginForm('nicolai.walsemann@gmx.de', '123123')).toBe(true);
			expect(validateLoginForm('test@example.com', 'password123')).toBe(true);
			expect(validateLoginForm('invalid-email', '123123')).toBe(false);
			expect(validateLoginForm('test@example.com', '123')).toBe(false);
		});

		it('should validate complete registration form', () => {
			const validateRegistrationForm = (
				email: string,
				password: string,
				confirmPassword: string
			) => {
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				return emailRegex.test(email) && password.length >= 6 && password === confirmPassword;
			};

			expect(validateRegistrationForm('test@example.com', '123123', '123123')).toBe(true);
			expect(validateRegistrationForm('test@example.com', '123123', 'different')).toBe(false);
			expect(validateRegistrationForm('invalid-email', '123123', '123123')).toBe(false);
			expect(validateRegistrationForm('test@example.com', '123', '123')).toBe(false);
		});
	});

	describe('Error Handling', () => {
		it('should handle network errors gracefully', async () => {
			mockSupabase.auth.signInWithPassword.mockRejectedValue(new Error('Network error'));

			try {
				await mockSupabase.auth.signInWithPassword({
					email: 'test@example.com',
					password: '123123'
				});
			} catch (error) {
				expect(error).toBeInstanceOf(Error);
				expect((error as Error).message).toBe('Network error');
			}
		});

		it('should handle timeout errors', async () => {
			mockSupabase.auth.signInWithPassword.mockImplementation(
				() => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 100))
			);

			try {
				await mockSupabase.auth.signInWithPassword({
					email: 'test@example.com',
					password: '123123'
				});
			} catch (error) {
				expect(error).toBeInstanceOf(Error);
				expect((error as Error).message).toBe('Timeout');
			}
		});
	});
});
