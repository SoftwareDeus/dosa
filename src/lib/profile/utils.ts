export type GooglePeople = {
	names?: Array<{ displayName?: string | null }>;
	emailAddresses?: Array<{ value?: string | null }>;
	phoneNumbers?: Array<{ value?: string | null }>;
	genders?: Array<{ value?: string | null }>;
	birthdays?: Array<{
		text?: string | null;
		date?: { year?: number | null; month?: number | null; day?: number | null } | null;
	}>;
	locales?: Array<{ value?: string | null }>;
	organizations?: Array<{ name?: string | null }>;
	photos?: Array<{ url?: string | null }>;
};

export type AccountUser = {
	id?: string | null;
	email?: string | null;
	created_at?: string | null;
	last_sign_in_at?: string | null;
} | null;

import type { Json } from '$lib/types/json';

export function isGooglePeople(value: Json | null): value is GooglePeople {
	return typeof value === 'object' && value !== null;
}

export function deriveName(google: GooglePeople | null, userEmail: string | null): string {
	const googleName = google?.names?.[0]?.displayName ?? null;
	return googleName || (userEmail ? userEmail.split('@')[0] : '') || '';
}

export function derivePhone(google: GooglePeople | null): string {
	return google?.phoneNumbers?.[0]?.value ?? '';
}

export function deriveAvatarUrl(google: GooglePeople | null): string {
	return google?.photos?.[0]?.url ?? '';
}
