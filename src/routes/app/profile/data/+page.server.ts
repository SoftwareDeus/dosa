import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
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

    // Prefer health profile from dedicated table; fallback to user_metadata for legacy data
    const supabase = event.locals.supabase;
    type HealthRow = {
        height_cm: number | null;
        age_years: number | null;
        sex: string | null;
        weight_kg: number | null;
        diet_type: string | null;
        water_intake: string | null;
        allergies: string | null;
        medications: string | null;
        chronic_conditions: string | null;
        blood_type: string | null;
        activity_level: string | null;
    };
    let tableHealth: HealthRow | null = null;
    if (supabase) {
        const { data: row, error: rowErr } = await supabase
            .from('health_profiles')
            .select(
                'height_cm, age_years, sex, weight_kg, diet_type, water_intake, allergies, medications, chronic_conditions, blood_type, activity_level'
            )
            .eq('user_id', user.id)
            .maybeSingle();
        if (!rowErr && row) tableHealth = row as HealthRow;
    }

    // Legacy metadata fallback
    const healthProfile = (user.user_metadata as Record<string, Json> | undefined)?.healthProfile as
        | Record<string, Json>
        | undefined;

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
        },
        healthDefaults: {
            // prefer table values; otherwise use metadata
            heightCm: Number(
                (tableHealth?.height_cm ?? null) ?? (healthProfile?.heightCm as number | undefined) ?? 0
            ),
            ageYears: Number(
                (tableHealth?.age_years ?? null) ?? (healthProfile?.ageYears as number | undefined) ?? 0
            ),
            sex: (tableHealth?.sex ?? (healthProfile?.sex as string) ?? '') as string,
            weightKg: Number(
                (tableHealth?.weight_kg ?? null) ?? (healthProfile?.weightKg as number | undefined) ?? 0
            ),
            dietType: (tableHealth?.diet_type ?? (healthProfile?.dietType as string) ?? '') as string,
            waterIntake: (tableHealth?.water_intake ?? (healthProfile?.waterIntake as string) ?? '') as string,
            allergies: (tableHealth?.allergies ?? (healthProfile?.allergies as string) ?? '') as string,
            medications: (tableHealth?.medications ?? (healthProfile?.medications as string) ?? '') as string,
            chronicConditions: (tableHealth?.chronic_conditions ?? (healthProfile?.chronicConditions as string) ?? '') as string,
            bloodType: (tableHealth?.blood_type ?? (healthProfile?.bloodType as string) ?? '') as string,
            activityLevel: (tableHealth?.activity_level ?? (healthProfile?.activityLevel as string) ?? '') as string
        }
    };
};

export const actions: Actions = {
	default: async (_event) => {
		// Placeholder for saving profile updates if needed
		return { success: true };
    },
    saveHealth: async (event) => {
        const user = await requireUserPage(event);
        const data = await event.request.formData();

        const parseNumber = (v: FormDataEntryValue | null) => {
            if (v == null) return 0;
            const raw = String(v).replace(',', '.');
            const n = Number(raw);
            return Number.isFinite(n) && n >= 0 ? n : 0;
        };

        // accept meters (e.g., 1.80) and convert to cm if < 3
        let heightVal = parseNumber(data.get('heightCm'));
        const heightCm = heightVal > 0 && heightVal < 3 ? Math.round(heightVal * 100) : Math.round(heightVal);
        const ageYears = parseNumber(data.get('ageYears'));
        const weightKg = parseNumber(data.get('weightKg'));
        const sex = String(data.get('sex') ?? '').toLowerCase();
        const dietType = String(data.get('dietType') ?? '').toLowerCase();
        const waterIntake = String(data.get('waterIntake') ?? '').toLowerCase();
        const allergies = String(data.get('allergies') ?? '');
        const medications = String(data.get('medications') ?? '');
        const chronicConditions = String(data.get('chronicConditions') ?? '');
        const bloodType = String(data.get('bloodType') ?? '');
        const activityLevel = String(data.get('activityLevel') ?? '').toLowerCase();

        const supabase = event.locals.supabase;
        if (!supabase) return { success: false };

        const { error: updateError } = await supabase.auth.updateUser({
            data: {
                healthProfile: {
                    heightCm,
                    ageYears,
                    sex,
                    weightKg,
                    dietType,
                    waterIntake,
                    allergies,
                    medications,
                    chronicConditions,
                    bloodType,
                    activityLevel
                }
            }
        });

        if (updateError) {
            console.error('saveHealth updateUser error:', updateError.message);
            return fail(500, { message: updateError.message });
        }

        return { success: true, updatedUserId: user.id };
    }
};
