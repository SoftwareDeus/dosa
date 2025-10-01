import type { PageServerLoad } from './$types';
import { requireUserPage } from '$lib/server/auth';
import type { Json } from '$lib/types/json';
import {
	isGooglePeople,
	deriveName,
	derivePhone,
	deriveAvatarUrl,
	type GooglePeople
} from '$lib/profile/utils';

export const prerender = false;

export const load: PageServerLoad = async (event) => {
	const user = await requireUserPage(event);

	const res = await event.fetch('/api/me');
	const j = (await res.json()) as { ok: boolean; data: Record<string, Json>; ts: string };

	const me: Record<string, Json> | null = j.ok ? j.data : null;
	const lastTs = j.ts;

	const google = isGooglePeople(me?.google ?? null) ? (me?.google as GooglePeople) : null;
	const formName = deriveName(google, user.email ?? null);
	const formPhone = derivePhone(google);
	const formAvatarUrl = deriveAvatarUrl(google);

	return {
		user: { id: user.id, email: user.email },
		me,
		lastTs,
		formName,
		formPhone,
		formAvatarUrl
	};
};
