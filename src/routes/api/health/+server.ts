import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { requireUserAPI } from '$lib/server/auth';
import type { HealthProfilePartial } from '$lib/types/health';
import { toRow } from '$lib/types/health';

type SavePayload = HealthProfilePartial;

function parseNumberLoose(v: unknown): number {
    if (v == null) return 0;
    const n = Number(String(v).replace(',', '.'));
    return Number.isFinite(n) && n >= 0 ? n : 0;
}

export const POST: RequestHandler = async (event) => {
    const user = await requireUserAPI(event);
    const t0 = Date.now();
    const debug = (msg: string, extra?: unknown) => {
        const dt = `${Date.now() - t0}ms`;
        // eslint-disable-next-line no-console
        console.log(`[api/health] ${dt} ${msg}`, extra ?? '');
    };
    debug('start');

    const supabase = event.locals.supabase;
    if (!supabase) return json({ ok: false, error: { message: 'Supabase not available' } }, { status: 500 });

    let body: SavePayload;
    try {
        body = (await event.request.json()) as SavePayload;
        debug('body parsed');
    } catch {
        return json({ ok: false, error: { message: 'Invalid JSON body' } }, { status: 400 });
    }

    // Build DB payload from typed partial
    const updates = toRow(user.id, body);
    debug('sanitized updates', updates);

    debug('upserting to health_profiles');
    const { data, error } = await supabase
        .from('health_profiles')
        .upsert(updates, { onConflict: 'user_id' })
        .select();
    if (error) {
        debug('upsert error', error);
        return json(
            {
                ok: false,
                error: {
                    message: error.message,
                    code: (error as any)?.code ?? null,
                    details: (error as any)?.details ?? null,
                    hint: (error as any)?.hint ?? null
                }
            },
            { status: 500 }
        );
    }
    debug('upsert ok', { rows: Array.isArray(data) ? data.length : 1 });
    return json({ ok: true, data });
};


