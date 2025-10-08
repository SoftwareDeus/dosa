import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { logger } from '$lib/logger';
import { requireUserAPI } from '$lib/server/auth';
import { toRow, type HealthProfilePartial } from '$lib/types/health';
import type { Json } from '$lib/types/json';

// Request payload is a partial health profile
type SavePayload = HealthProfilePartial;

export const POST: RequestHandler = async (event) => {
	const user = await requireUserAPI(event);
	const t0 = Date.now();
	const debug = (msg: string, extra?: Record<string, Json> | null): void => {
		const dt = `${Date.now() - t0}ms`;
		logger.info(`[api/health] ${dt} ${msg}`, extra ?? undefined);
	};
	debug('start');

	const supabase = event.locals.supabase;
	if (!supabase)
		return json({ ok: false, error: { message: 'Supabase not available' } }, { status: 500 });

	let body: SavePayload;
	try {
		body = (await event.request.json()) as SavePayload;
		debug('body parsed');
	} catch {
		return json({ ok: false, error: { message: 'Invalid JSON body' } }, { status: 400 });
	}

	// Build DB payload from typed partial
	const updates = toRow(user.id, body);
	debug('sanitized updates', updates as Record<string, Json>);

	debug('upserting to health_profiles');
	const { data, error } = await supabase
		.from('health_profiles')
		.upsert(updates, { onConflict: 'user_id' })
		.select();
	if (error) {
		debug('upsert error', {
			message: error.message,
			code: (error as { code?: string } | null)?.code ?? null,
			details: (error as { details?: string } | null)?.details ?? null,
			hint: (error as { hint?: string } | null)?.hint ?? null
		});
		return json(
			{
				ok: false,
				error: {
					message: error.message,
					code: (error as { code?: string } | null)?.code ?? null,
					details: (error as { details?: string } | null)?.details ?? null,
					hint: (error as { hint?: string } | null)?.hint ?? null
				}
			},
			{ status: 500 }
		);
	}
	debug('upsert ok', { rows: Array.isArray(data) ? data.length : 1 });
	return json({ ok: true, data });
};
