import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async ({ url, parent }) => {
	// Get user from server-side auth (set by withSupabase)
	const { user } = await parent();

	if (!user) {
		// Redirect to login if not authenticated
		const next = encodeURIComponent(url.pathname + url.search);
		throw redirect(303, `/login?next=${next}`);
	}

	return {
		user: { id: user.id, email: user.email }
	};
};
