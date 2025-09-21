// Test Configuration
// This file contains test-specific configuration and credentials

export const testConfig = {
  // Test credentials - can be overridden by environment variables
  email: process.env.TEST_EMAIL || 'test@example.com',
  password: process.env.TEST_PASSWORD || 'testpassword123',
  
  // Test user data
  user: {
    id: 'test-user-123',
    email: process.env.TEST_EMAIL || 'test@example.com',
    created_at: new Date().toISOString()
  },
  
  // Test session data
  session: {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token'
  },
  
  // Test URLs
  redirectUrl: process.env.TEST_REDIRECT_URL || 'http://localhost:3000/auth/callback',
  
  // Test database (if needed)
  databaseUrl: process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db'
};

// Helper function to get test credentials
export function getTestCredentials() {
  return {
    email: testConfig.email,
    password: testConfig.password
  };
}

// Helper function to get test user data
export function getTestUser() {
  return testConfig.user;
}

// Helper function to get test session data
export function getTestSession() {
  return testConfig.session;
}

