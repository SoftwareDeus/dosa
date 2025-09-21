import type { RequestHandler } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { createServerClient } from '@supabase/ssr';

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

	// tauscht den OAuth code gegen Session-Cookies
	await supabase.auth.getSession();

	const next = url.searchParams.get('next') ?? '/app';
	return new Response(null, { status: 303, headers: { Location: next } });
};
