import { Capacitor } from '@capacitor/core';
import { supabase } from '$lib/supabase/client';
import { logger } from '$lib/logger';

export async function signInWithGoogle(origin: string, next: string): Promise<void> {
	const options = {
		redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
		flowType: 'pkce' as const
	};
	const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options });
	if (error) throw error;
}

export async function signInWithApple(origin: string, next: string): Promise<string | null> {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
            redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
            flowType: 'pkce'
        }
    });
	if (error) {
		logger.error('Apple login error', { error: error.message });
		return 'Mit Apple anmelden fehlgeschlagen';
	}
	return null;
}

export function shouldShowAppleSignIn(): boolean {
	const isIOS = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
	if (isIOS) return true;
	const ua = navigator.userAgent;
	return /iPad|iPhone|iPod/.test(ua) || (ua.includes('Safari') && !ua.includes('Chrome'));
}
