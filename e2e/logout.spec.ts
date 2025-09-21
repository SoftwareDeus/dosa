import { test, expect } from '@playwright/test';

test.describe('Logout Flow', () => {
  test('should redirect to login when accessing logout', async ({ page }) => {
    // Navigate to logout endpoint
    await page.goto('/logout');
    
    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/);
  });
});