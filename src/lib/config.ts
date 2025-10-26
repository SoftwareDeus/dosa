import { Capacitor } from '@capacitor/core';
import { env } from '$env/dynamic/public';

// No env fallback: rely on runtime origin only

export function getAppOrigin(): string {
	if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin;
	throw new Error('Origin unavailable in this runtime');
}

export function getRedirectUrl(next: string): string {
	const safeNext = next || '/app';
	
	// When running in Capacitor, use deep link scheme directly
	if (Capacitor.isNativePlatform()) {
		return `dosa://localhost/auth/callback?next=${encodeURIComponent(safeNext)}`;
	}
	
	// For web, use regular origin-based URL
	const origin = getAppOrigin();
	return `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;
}
