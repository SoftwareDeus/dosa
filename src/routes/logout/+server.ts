import { redirect, type RequestHandler } from '@sveltejs/kit';
import { logger } from '$lib/logger';

export const prerender = false;

export const GET: RequestHandler = async ({ locals, cookies, url: _url }) => {
	try {
		logger.auth('Logout route called - starting logout process');

		const { error } = await locals.supabase.auth.signOut();

		if (error) {
			logger.error('Supabase logout error', { error: error.message });
		} else {
			logger.auth('Supabase logout successful');
		}

		const cookieNames = [
			'sb-access-token',
			'sb-refresh-token',
			'sb-provider-token',
			'sb-provider-refresh-token',
			'sb-mammexsdwfylvjsvxmnk-auth-token',
			'sb-mammexsdwfylvjsvxmnk-auth-token.0',
			'sb-mammexsdwfylvjsvxmnk-auth-token.1'
		];

		cookieNames.forEach((name) => {
			cookies.delete(name, { path: '/' });
			cookies.delete(name, { path: '/', domain: '.supabase.co' });
		});

		const allCookies = cookies.getAll();
		allCookies.forEach((cookie) => {
			if (cookie.name.startsWith('sb-')) {
				cookies.delete(cookie.name, { path: '/' });
			}
		});

		logger.auth('All cookies cleared');

		logger.navigation('Redirecting to login page');
		throw redirect(303, '/login');
	} catch (error) {
		logger.error('Logout error', { error: error instanceof Error ? error.message : String(error) });
		throw redirect(303, '/login');
	}
};

export const POST: RequestHandler = async (event) => {
	return GET(event);
};
