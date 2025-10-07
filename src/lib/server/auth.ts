// src/lib/server/auth.ts
import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { error, redirect, type RequestEvent } from '@sveltejs/kit';
import { HttpStatus } from '$lib/types/http';
import type { User } from '@supabase/supabase-js';

export async function getUserFromRequest(event: RequestEvent): Promise<User | null> {
	// Use the already authenticated user from locals (set by withSupabase)
	if (event.locals.user) return event.locals.user;

    const auth = event.request.headers.get('authorization');
    if (auth?.startsWith('Bearer ')) {
        const BEARER_PREFIX = 'Bearer ';
        const token = auth.slice(BEARER_PREFIX.length);

		const emptyCookies: CookieMethodsServer = {
			getAll: () => [],
			setAll: () => {}
		};

        const sb = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
			cookies: emptyCookies,
			cookieOptions: { name: 'sb' },
			cookieEncoding: 'base64url'
		});

        const {
            data: { user }
        } = await sb.auth.getUser(token);
		if (user) return user;
	}
	return null;
}

export async function requireUserAPI(event: RequestEvent): Promise<User> {
	const user = await getUserFromRequest(event);
	if (!user) throw error(HttpStatus.UNAUTHORIZED, 'Unauthorized');
	return user;
}

export async function requireUserPage(event: RequestEvent, next = '/app'): Promise<User> {
	const user = await getUserFromRequest(event);
	if (!user) {
		const nextUrl = event.url.pathname + event.url.search || next; // Klammern beachten!
		throw redirect(HttpStatus.SEE_OTHER, `/login?next=${encodeURIComponent(nextUrl)}`);
	}
	return user;
}
