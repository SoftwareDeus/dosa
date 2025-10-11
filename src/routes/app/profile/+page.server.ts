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
	
	// Get health profile data from database
	const { data: healthRow } = await event.locals.supabase
		.from('health_profiles')
		.select('*')
		.eq('user_id', user.id)
		.maybeSingle();

	// Convert database format to frontend format
	const healthProfile = healthRow
		? {
				age: healthRow.age_years,
				height: healthRow.height_cm,
				weight: healthRow.weight_kg,
				bloodType: healthRow.blood_type,
				allergies: healthRow.allergies,
				medications: healthRow.medications,
				conditions: healthRow.chronic_conditions
		  }
		: null;

	return {
		user: { id: user.id, email: user.email },
		me,
		lastTs,
		formName,
		formPhone,
		formAvatarUrl,
		healthProfile
	};
};
