import type { PageServerLoad } from './$types';
import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { HttpStatus } from '$lib/types/http';
import { redirect } from '@sveltejs/kit';

export const prerender = false;

export const load: PageServerLoad = async (event) => {
	const code = event.url.searchParams.get('code');
	const next = event.url.searchParams.get('next') ?? '/app';

	if (!code) {
		// No code: render the page so the client can process hash tokens
		return {};
	}

	const supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll().map((c) => ({ name: c.name, value: c.value })),
			setAll: (arr) =>
				arr.forEach(({ name, value, options }) =>
					event.cookies.set(name, value, {
						...options,
						path: '/',
						httpOnly: true,
						secure: true,
						sameSite: 'lax'
					})
				)
		},
		cookieOptions: { name: 'sb' },
		cookieEncoding: 'base64url'
	});

	const { error } = await supabase.auth.exchangeCodeForSession(code);
	if (error) {
		throw redirect(
			HttpStatus.SEE_OTHER,
			`/login?error=auth_failed&message=${encodeURIComponent(error.message)}`
		);
	}

	// Optionally verify user
	const {
		data: { user }
	} = await supabase.auth.getUser();
	if (!user) {
		throw redirect(HttpStatus.SEE_OTHER, '/login?error=auth_failed&message=No%20user');
	}

	throw redirect(HttpStatus.SEE_OTHER, next);
};
