// No env fallback: rely on runtime origin only

export function getAppOrigin(): string {
    if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin;
    throw new Error('Origin unavailable in this runtime');
}

export function getRedirectUrl(next: string): string {
    const origin = getAppOrigin();
    const safeNext = next || '/app';
    return `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;
}


