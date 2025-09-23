import type { RequestHandler } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createServerClient } from '@supabase/ssr';
import { HttpStatus } from '$lib/types/http';

export const GET: RequestHandler = async ({ cookies, url }) => {
	const supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => cookies.getAll().map((c) => ({ name: c.name, value: c.value })),
			setAll: (arr) =>
				arr.forEach(({ name, value, options }) =>
					cookies.set(name, value, {
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

	const code = url.searchParams.get('code');
	const next = url.searchParams.get('next') ?? '/app';

	if (!code) {
		return new Response(null, {
			status: HttpStatus.SEE_OTHER,
			headers: { Location: '/login?error=auth_failed&message=Missing%20code' }
		});
	}

	const { error } = await supabase.auth.exchangeCodeForSession(code);
	if (error) {
		return new Response(null, {
			status: HttpStatus.SEE_OTHER,
			headers: { Location: `/login?error=auth_failed&message=${encodeURIComponent(error.message)}` }
		});
	}

	// Optional: verify user exists
	const {
		data: { user }
	} = await supabase.auth.getUser();
	if (!user) {
		return new Response(null, {
			status: HttpStatus.SEE_OTHER,
			headers: { Location: '/login?error=auth_failed&message=No%20user' }
		});
	}

	return new Response(null, { status: HttpStatus.SEE_OTHER, headers: { Location: next } });
};
