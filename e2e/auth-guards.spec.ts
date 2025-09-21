import { test, expect } from '@playwright/test';

test.describe('Authentication Guards', () => {
	test('should redirect unauthenticated users to login', async ({ page }) => {
		// Try to access protected route without authentication
		await page.goto('/app');

		// Should redirect to login page
		await expect(page).toHaveURL(/\/login/);
	});

	test('should redirect unauthenticated users to login with next parameter', async ({ page }) => {
		// Try to access specific protected route
		await page.goto('/app/profile');

		// Should redirect to login with next parameter
		await expect(page).toHaveURL(/\/login\?next=/);
		expect(page.url()).toContain('next=%2Fapp%2Fprofile');
	});

	test('should show login page for unauthenticated users', async ({ page }) => {
		await page.goto('/login');

		// Should show login form
		await expect(page.getByLabel('E-Mail')).toBeVisible();
		await expect(page.getByLabel('Passwort')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Anmelden', exact: true })).toBeVisible();
	});
});
