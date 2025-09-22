import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
    try {
        const { data: { session } } = await locals.supabase.auth.getSession();
        const { data: { user } } = await locals.supabase.auth.getUser();

        if (user && session) {
            locals.session = session;
            locals.user = user;
            return json({ authenticated: true, user: { id: user.id, email: user.email } });
        }

        return json({ authenticated: false }, { status: 401 });
    } catch (error) {
        return json({ authenticated: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
};
