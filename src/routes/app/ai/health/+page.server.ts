import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const {
		data: { session }
	} = await locals.supabase.auth.getSession();

	if (!session) {
		throw redirect(303, '/login');
	}

	const {
		data: { user }
	} = await locals.supabase.auth.getUser();

	if (!user) {
		throw redirect(303, '/login');
	}

	// Get existing health profile data from database
	const { data: healthRow } = await locals.supabase
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
		user: {
			id: user.id,
			email: user.email,
			name: user.user_metadata?.name || user.email?.split('@')[0] || 'User'
		},
		healthProfile
	};
};

