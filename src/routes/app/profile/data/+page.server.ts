import type { Actions, PageServerLoad } from './$types';
import { requireUserPage } from '$lib/server/auth';

export const prerender = false;

export const load: PageServerLoad = async (event) => {
    const user = await requireUserPage(event);
    const { data: { session } } = await event.locals.supabase.auth.getSession();
    const { data: { user: fullUser } } = await event.locals.supabase.auth.getUser();

    // Reuse the internal API logic by calling directly
    const res = await event.fetch('/api/me');
    const me = await res.json();

    return {
        user: { id: user.id, email: user.email },
        me
    };
};

export const actions: Actions = {
    default: async (event) => {
        // Placeholder for saving profile updates if needed
        return { success: true };
    }
};

