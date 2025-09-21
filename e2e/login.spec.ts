import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should show login page', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Should show login form elements
    await expect(page.getByLabel('E-Mail')).toBeVisible();
    await expect(page.getByLabel('Passwort')).toBeVisible();
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access protected route
    await page.goto('/app');
    
    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/);
  });
});