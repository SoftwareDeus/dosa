import { json, type RequestHandler } from '@sveltejs/kit';
import { HttpStatus } from '$lib/types/http';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		const {
			data: { session }
		} = await locals.supabase.auth.getSession();
		const {
			data: { user }
		} = await locals.supabase.auth.getUser();

		if (user && session) {
			locals.session = session;
			locals.user = user;
			return json({ authenticated: true, user: { id: user.id, email: user.email } });
		}

		return json({ authenticated: false }, { status: HttpStatus.UNAUTHORIZED });
	} catch (error) {
		return json(
			{ authenticated: false, error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: HttpStatus.INTERNAL_SERVER_ERROR }
		);
	}
};
