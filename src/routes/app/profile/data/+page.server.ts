import type { Actions, PageServerLoad } from './$types';
import { requireUserPage } from '$lib/server/auth';
import type { Json } from '$lib/types/json';
import {
	isGooglePeople,
	deriveName,
	derivePhone,
	deriveAvatarUrl,
	type GooglePeople,
	type AccountUser
} from '$lib/profile/utils';

export const prerender = false;

export const load: PageServerLoad = async (event) => {
	const user = await requireUserPage(event);

	// Reuse the internal API logic by calling directly
	const res = await event.fetch('/api/me');
	const me = (await res.json()) as { ok: boolean; data: Record<string, Json>; ts: string };

	const google = isGooglePeople(me?.data?.google ?? null) ? (me.data.google as GooglePeople) : null;
	const accountUser: AccountUser = (me?.data?.user as AccountUser) ?? null;
	const providers: string[] | null = Array.isArray(me?.data?.providers)
		? (me.data.providers as Json[]).filter((p): p is string => typeof p === 'string')
		: null;

	return {
		user: { id: user.id, email: user.email },
		me,
		google,
		accountUser,
		providers,
		formDefaults: {
			name: deriveName(google, user.email ?? null),
			phone: derivePhone(google),
			avatarUrl: deriveAvatarUrl(google)
		}
	};
};

export const actions: Actions = {
	default: async (_event) => {
		// Placeholder for saving profile updates if needed
		return { success: true };
	}
};
