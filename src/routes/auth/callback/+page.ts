import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { supabase } from '$lib/supabase/client';
import { logger } from '$lib/logger';

export const load: PageLoad = async ({ url }) => {
	const code = url.searchParams.get('code');
	const next = url.searchParams.get('next') || '/app';

	if (code) {
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		if (error) {
			logger.error('Auth callback error', { error: error.message });
			throw redirect(303, `/login?error=auth_failed&message=${encodeURIComponent(error.message)}`);
		}
	}

	// Check if user is authenticated (use getUser for security)
	const {
		data: { user }
	} = await supabase.auth.getUser();
	if (!user) {
		throw redirect(303, '/login');
	}

	throw redirect(303, next);
};
