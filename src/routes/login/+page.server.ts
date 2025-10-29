import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { HttpStatus } from '$lib/types/http';

export const prerender = false;

export const load: PageServerLoad = async (event) => {
    if (event.locals.user) {
        const next = event.url.searchParams.get('next') || '/';
        throw redirect(HttpStatus.SEE_OTHER, next);
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

		if (!email || !password)
			return fail(HttpStatus.BAD_REQUEST, { message: 'Email und Passwort erforderlich' });

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return fail(HttpStatus.BAD_REQUEST, { message: 'Bitte gib eine gültige E-Mail-Adresse ein' });
		}

		// Validate password strength
		const MIN_PASSWORD_LENGTH = 6;
		if (password.length < MIN_PASSWORD_LENGTH) {
			return fail(HttpStatus.BAD_REQUEST, {
				message: 'Passwort muss mindestens 6 Zeichen lang sein'
			});
		}

		if (action === 'register') {
			// Registration logic
			if (!confirmPassword)
				return fail(HttpStatus.BAD_REQUEST, { message: 'Passwort-Bestätigung erforderlich' });

			if (password !== confirmPassword) {
				return fail(HttpStatus.BAD_REQUEST, { message: 'Passwörter stimmen nicht überein' });
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
					return fail(HttpStatus.BAD_REQUEST, {
						message: 'Diese E-Mail-Adresse ist bereits registriert'
					});
				}
				return fail(HttpStatus.BAD_REQUEST, { message: error.message });
			}

			if (data.user && !data.session) {
				// Email confirmation required
				return fail(HttpStatus.OK, {
					message: 'Bitte überprüfe deine E-Mails und klicke auf den Bestätigungslink'
				});
			}

			// User is automatically signed in after registration
            const next = event.url.searchParams.get('next') || '/';
			throw redirect(HttpStatus.SEE_OTHER, next);
		} else {
			// Login logic
			const { data: _data, error } = await event.locals.supabase.auth.signInWithPassword({
				email,
				password
			});

			if (error) {
				// Handle specific Supabase errors
				if (error.message.includes('Invalid login credentials')) {
					return fail(HttpStatus.UNAUTHORIZED, { message: 'Ungültige Anmeldedaten' });
				}
				if (error.message.includes('Email not confirmed')) {
					return fail(HttpStatus.UNAUTHORIZED, {
						message: 'Bitte bestätige zuerst deine E-Mail-Adresse'
					});
				}
				return fail(HttpStatus.UNAUTHORIZED, { message: error.message });
			}

            const next = event.url.searchParams.get('next') || '/';
			throw redirect(HttpStatus.SEE_OTHER, next);
		}
	}
};
