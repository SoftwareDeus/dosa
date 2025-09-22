// src/lib/supabase/server.ts
import {
	createServerClient,
	type CookieOptionsWithName,
	type CookieMethodsServer
} from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Handle } from '@sveltejs/kit';

export const withSupabase: Handle = async ({ event, resolve }) => {
	const cookieMethods: CookieMethodsServer = {
		getAll: () => event.cookies.getAll().map((c) => ({ name: c.name, value: c.value })),
		setAll: (cookies) => {
			for (const { name, value, options } of cookies) {
				event.cookies.set(name, value, {
					...options,
					path: '/',
					httpOnly: true,
					secure: true,
					sameSite: 'lax'
				});
			}
		}
	};

	const supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: cookieMethods,
		cookieOptions: { name: 'sb' } as CookieOptionsWithName,
		cookieEncoding: 'base64url'
	});

	const {
		data: { session }
	} = await supabase.auth.getSession();
	
	let user = null;
	if (session) {
		// If we have a session, try to get the user
		const { data: userData } = await supabase.auth.getUser();
		user = userData.user;
	}

	// Debug log for OAuth issues
	if (event.url.pathname.includes('/login') || event.url.pathname.includes('/auth/callback')) {
		console.log('🔧 withSupabase:', {
			path: event.url.pathname,
			hasSession: !!session,
			hasUser: !!user,
			sessionUser: session?.user?.email,
			cookieCount: event.cookies.getAll().length
		});
	}

	event.locals.supabase = supabase;
	event.locals.session = session ?? null;
	event.locals.user = user ?? null;

	return resolve(event);
};
