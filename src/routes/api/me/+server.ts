import { json, type RequestHandler } from '@sveltejs/kit';
import { HttpStatus } from '$lib/types/http';

// Aggregates Supabase session/user info and Google profile data if available
export const GET: RequestHandler = async ({ locals }) => {
	try {
		const {
			data: { session }
		} = await locals.supabase.auth.getSession();
		const {
			data: { user }
		} = await locals.supabase.auth.getUser();

		const response: Record<string, unknown> = {
			session: session ?? null,
			user: user ?? null,
			providers: user?.app_metadata?.provider
				? [user.app_metadata.provider]
				: (user?.identities?.map((i: { provider: string }) => i.provider) ?? [])
		};

		// Try to fetch Google data if we have provider token in cookies
		// Supabase sets `sb-provider-token` for OAuth providers when available
		const providerToken = (await locals.supabase.auth.getSession()).data.session?.provider_token as
			| string
			| undefined;

		if (providerToken && (response.providers as string[]).includes('google')) {
			try {
				const personFields = [
					'names',
					'emailAddresses',
					'photos',
					'phoneNumbers',
					'genders',
					'birthdays',
					'locales',
					'organizations'
				].join(',');
				const peopleRes = await fetch(
					`https://people.googleapis.com/v1/people/me?personFields=${encodeURIComponent(personFields)}`,
					{
						headers: { Authorization: `Bearer ${providerToken}` }
					}
				);
				if (peopleRes.ok) {
					const people = await peopleRes.json();
					response.google = people;
				} else {
					response.google_error = { status: peopleRes.status };
				}
			} catch (e) {
				response.google_error = { message: e instanceof Error ? e.message : String(e) };
			}
		}

		return json({ ok: true, data: response, ts: new Date().toISOString() });
	} catch (error) {
		return json(
			{ ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: HttpStatus.INTERNAL_SERVER_ERROR }
		);
	}
};

export const prerender = false;
