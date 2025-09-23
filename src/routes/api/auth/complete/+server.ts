import { json, type RequestHandler } from '@sveltejs/kit';
import { logger } from '$lib/logger';
import { HttpStatus } from '$lib/types/http';

export const POST: RequestHandler = async ({ locals, request }) => {
	try {
		const body = await request.json().catch(() => ({}));
		const next: string | null = body?.next ?? null;
		const access_token: string | null = body?.access_token ?? null;
		const refresh_token: string | null = body?.refresh_token ?? null;

		if (access_token && refresh_token) {
			// Set session on the server from client-provided tokens (implicit flow)
			const { error: setErr } = await locals.supabase.auth.setSession({
				access_token,
				refresh_token
			});
			if (setErr) {
				return json({ success: false, error: setErr.message }, { status: HttpStatus.UNAUTHORIZED });
			}
		}

		// Verify session after either setSession or existing cookies
		const {
			data: { session }
		} = await locals.supabase.auth.getSession();
		const {
			data: { user }
		} = await locals.supabase.auth.getUser();

		if (user && session) {
			// Update locals for this request lifecycle
			locals.session = session;
			locals.user = user;
			return json({
				success: true,
				user: { id: user.id, email: user.email },
				next: next ?? '/app'
			});
		}

		return json(
			{ success: false, error: 'No valid session found' },
			{ status: HttpStatus.UNAUTHORIZED }
		);
	} catch (error) {
		logger.error('Auth complete error', {
			error: error instanceof Error ? error.message : String(error)
		});
		return json(
			{ success: false, error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: HttpStatus.INTERNAL_SERVER_ERROR }
		);
	}
};
