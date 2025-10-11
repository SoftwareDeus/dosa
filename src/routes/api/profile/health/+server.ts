import { json, type RequestHandler } from '@sveltejs/kit';
import { HttpStatus } from '$lib/types/http';

interface HealthData {
	age?: number;
	height?: number;
	weight?: number;
	bloodType?: string;
	allergies?: string;
	medications?: string;
	conditions?: string;
}

export const GET: RequestHandler = async ({ locals }) => {
	try {
		const {
			data: { session }
		} = await locals.supabase.auth.getSession();

		if (!session) {
			return json({ error: 'Unauthorized' }, { status: HttpStatus.UNAUTHORIZED });
		}

		const {
			data: { user }
		} = await locals.supabase.auth.getUser();

		if (!user) {
			return json({ error: 'User not found' }, { status: HttpStatus.NOT_FOUND });
		}

		// Get health data from health_profiles table
		const { data: healthRow, error } = await locals.supabase
			.from('health_profiles')
			.select('*')
			.eq('user_id', user.id)
			.maybeSingle();

		if (error) {
			console.error('Error fetching health profile:', error);
			return json({ error: error.message }, { status: HttpStatus.INTERNAL_SERVER_ERROR });
		}

		// Convert database format to API format
		const healthData: HealthData | null = healthRow
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

		return json({ ok: true, data: healthData });
	} catch (error) {
		console.error('Get health data error:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: HttpStatus.INTERNAL_SERVER_ERROR }
		);
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const {
			data: { session }
		} = await locals.supabase.auth.getSession();

		if (!session) {
			return json({ error: 'Unauthorized' }, { status: HttpStatus.UNAUTHORIZED });
		}

		const {
			data: { user }
		} = await locals.supabase.auth.getUser();

		if (!user) {
			return json({ error: 'User not found' }, { status: HttpStatus.NOT_FOUND });
		}

		const healthData: HealthData = await request.json();

		// Validate health data
		if (typeof healthData !== 'object') {
			return json({ error: 'Invalid health data format' }, { status: HttpStatus.BAD_REQUEST });
		}

		console.log('Saving health data to database:', healthData);

		// Save to health_profiles table in Supabase
		const { error } = await locals.supabase.from('health_profiles').upsert(
			{
				user_id: user.id,
				height_cm: healthData.height || null,
				age_years: healthData.age || null,
				weight_kg: healthData.weight || null,
				blood_type: healthData.bloodType || null,
				allergies: healthData.allergies || null,
				medications: healthData.medications || null,
				chronic_conditions: healthData.conditions || null,
				updated_at: new Date().toISOString()
			},
			{
				onConflict: 'user_id'
			}
		);

		if (error) {
			console.error('Supabase update error:', error);
			return json({ error: error.message }, { status: HttpStatus.INTERNAL_SERVER_ERROR });
		}

		console.log('Health data saved successfully to health_profiles table');
		return json({ ok: true, message: 'Health data saved successfully' });
	} catch (error) {
		console.error('Save health data error:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: HttpStatus.INTERNAL_SERVER_ERROR }
		);
	}
};

export const prerender = false;

