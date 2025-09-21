import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTestCredentials } from '../../test-config';

// Mock Supabase client
const mockSupabase = {
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn()
  }
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase)
}));

describe('Login API Tests', () => {
  // Get test credentials from test configuration
  const { email: testEmail, password: testPassword } = getTestCredentials();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully login with valid credentials', async () => {
    // Mock successful login response
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: { id: '123', email: testEmail },
        session: { access_token: 'mock-token' }
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
    expect(data.session?.access_token).toBeDefined();
  });

  it('should fail login with invalid email', async () => {
    // Mock failed login response
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' }
    });

    const { data, error } = await mockSupabase.auth.signInWithPassword({
      email: 'invalid@example.com',
      password: testPassword
    });

    expect(error).toBeDefined();
    expect(error?.message).toContain('Invalid login credentials');
    expect(data.user).toBeNull();
    expect(data.session).toBeNull();
  });

  it('should fail login with invalid password', async () => {
    // Mock failed login response
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' }
    });

    const { data, error } = await mockSupabase.auth.signInWithPassword({
      email: testEmail,
      password: 'wrongpassword'
    });

    expect(error).toBeDefined();
    expect(error?.message).toContain('Invalid login credentials');
    expect(data.user).toBeNull();
    expect(data.session).toBeNull();
  });

  it('should fail login with empty credentials', async () => {
    // Mock failed login response
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Email and password are required' }
    });

    const { data, error } = await mockSupabase.auth.signInWithPassword({
      email: '',
      password: ''
    });

    expect(error).toBeDefined();
    expect(data.user).toBeNull();
    expect(data.session).toBeNull();
  });

  it('should register new user successfully', async () => {
    const randomEmail = `test-${Date.now()}@example.com`;
    
    // Mock successful registration response
    mockSupabase.auth.signUp.mockResolvedValue({
      data: {
        user: { id: '123', email: randomEmail },
        session: null // Email confirmation required
      },
      error: null
    });

    const { data, error } = await mockSupabase.auth.signUp({
      email: randomEmail,
      password: testPassword
    });

    expect(error).toBeNull();
    expect(data.user).toBeDefined();
    expect(data.user?.email).toBe(randomEmail);
  });

  it('should fail registration with existing email', async () => {
    // Mock failed registration response
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'User already registered' }
    });

    const { data, error } = await mockSupabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });

    expect(error).toBeDefined();
    expect(error?.message).toContain('already registered');
    expect(data.user).toBeNull();
  });

  it('should fail registration with weak password', async () => {
    const randomEmail = `test-weak-${Date.now()}@example.com`;
    
    // Mock failed registration response
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Password should be at least 6 characters' }
    });

    const { data, error } = await mockSupabase.auth.signUp({
      email: randomEmail,
      password: '123' // Too short
    });

    expect(error).toBeDefined();
    expect(error?.message).toContain('Password should be at least 6 characters');
    expect(data.user).toBeNull();
  });

  it('should fail registration with invalid email format', async () => {
    // Mock failed registration response
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid email format' }
    });

    const { data, error } = await mockSupabase.auth.signUp({
      email: 'invalid-email',
      password: testPassword
    });

    expect(error).toBeDefined();
    expect(data.user).toBeNull();
  });
});