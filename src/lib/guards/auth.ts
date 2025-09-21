import { goto } from '$app/navigation';
import { supabase } from '$lib/supabase/client';
import { browser } from '$app/environment';
import { logger } from '$lib/logger';

// Define known routes to avoid ESLint warnings
const ROUTES = {
	LOGIN: '/login',
	APP: '/app'
} as const;

// Track redirects to prevent loops
let isRedirecting = false;

export async function requireAuth(redirectTo = ROUTES.LOGIN) {
	if (!browser) return false;

	// Prevent multiple redirects
	if (isRedirecting) {
		logger.debug('Already redirecting, skipping...');
		return false;
	}

	try {
		const {
			data: { user }
		} = await supabase.auth.getUser();

		if (!user) {
			logger.navigation('No user found, redirecting to login');
			isRedirecting = true;

			// Use goto for SvelteKit navigation
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			await goto(redirectTo, { replaceState: true });

			// Reset flag after a delay
			setTimeout(() => {
				isRedirecting = false;
			}, 1000);

			return false;
		}

		return true;
	} catch (error) {
		logger.error('Auth check error', {
			error: error instanceof Error ? error.message : String(error)
		});
		isRedirecting = true;
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		await goto(redirectTo, { replaceState: true });

		setTimeout(() => {
			isRedirecting = false;
		}, 1000);

		return false;
	}
}

export async function redirectIfAuthenticated(redirectTo = ROUTES.APP) {
	if (!browser) return false;

	// Prevent multiple redirects
	if (isRedirecting) {
		logger.debug('Already redirecting, skipping...');
		return false;
	}

	try {
		const {
			data: { user }
		} = await supabase.auth.getUser();

		if (user) {
			logger.navigation('User found, redirecting to app');
			isRedirecting = true;
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			await goto(redirectTo, { replaceState: true });

			setTimeout(() => {
				isRedirecting = false;
			}, 1000);

			return true;
		}

		return false;
	} catch (error) {
		logger.error('Auth check error', {
			error: error instanceof Error ? error.message : String(error)
		});
		return false;
	}
}

// Reset redirect flag (call this after successful auth)
export function resetRedirectFlag() {
	isRedirecting = false;
}
