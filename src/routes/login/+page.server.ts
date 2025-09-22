import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';

export const prerender = false;

export const load: PageServerLoad = async (event) => {
	console.log('🔍 Login page load:', { 
		hasUser: !!event.locals.user, 
		hasSession: !!event.locals.session,
		url: event.url.pathname + event.url.search,
		cookies: event.cookies.getAll().map(c => c.name)
	});
	
	if (event.locals.user) {
		const next = event.url.searchParams.get('next') || '/app';
		console.log('🚀 User found, redirecting to:', next);
		throw redirect(303, next);
	}

	// Handle OAuth errors
	const error = event.url.searchParams.get('error');
	const message = event.url.searchParams.get('message');

	return {
		error: error || null,
		message: message || null
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await event.request.formData();
		const action = String(form.get('action') ?? 'login');
		const email = String(form.get('email') ?? '');
		const password = String(form.get('password') ?? '');
		const confirmPassword = String(form.get('confirmPassword') ?? '');

		if (!email || !password) return fail(400, { message: 'Email und Passwort erforderlich' });

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return fail(400, { message: 'Bitte gib eine gültige E-Mail-Adresse ein' });
		}

		// Validate password strength
		if (password.length < 6) {
			return fail(400, { message: 'Passwort muss mindestens 6 Zeichen lang sein' });
		}

		if (action === 'register') {
			// Registration logic
			if (!confirmPassword) return fail(400, { message: 'Passwort-Bestätigung erforderlich' });

			if (password !== confirmPassword) {
				return fail(400, { message: 'Passwörter stimmen nicht überein' });
			}

			const { data, error } = await event.locals.supabase.auth.signUp({
				email,
				password,
				options: {
					emailRedirectTo: `${event.url.origin}/auth/callback`
				}
			});

			if (error) {
				// Handle specific Supabase errors
				if (error.message.includes('already registered')) {
					return fail(400, { message: 'Diese E-Mail-Adresse ist bereits registriert' });
				}
				return fail(400, { message: error.message });
			}

			if (data.user && !data.session) {
				// Email confirmation required
				return fail(200, {
					message: 'Bitte überprüfe deine E-Mails und klicke auf den Bestätigungslink'
				});
			}

			// User is automatically signed in after registration
			const next = event.url.searchParams.get('next') || '/app';
			throw redirect(303, next);
		} else {
			// Login logic
			const { data: _data, error } = await event.locals.supabase.auth.signInWithPassword({
				email,
				password
			});

			if (error) {
				// Handle specific Supabase errors
				if (error.message.includes('Invalid login credentials')) {
					return fail(401, { message: 'Ungültige Anmeldedaten' });
				}
				if (error.message.includes('Email not confirmed')) {
					return fail(401, { message: 'Bitte bestätige zuerst deine E-Mail-Adresse' });
				}
				return fail(401, { message: error.message });
			}

			const next = event.url.searchParams.get('next') || '/app';
			throw redirect(303, next);
		}
	}
};
