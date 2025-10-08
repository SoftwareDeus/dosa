import { Capacitor } from '@capacitor/core';
import { supabase } from '$lib/supabase/client';
import { logger } from '$lib/logger';
import { getRedirectUrl } from '$lib/config';

export async function signInWithGoogle(_origin: string, next: string): Promise<void> {
	const options = {
		redirectTo: getRedirectUrl(next)
	};
	const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options });
	if (error) throw error;
}

export async function signInWithApple(_origin: string, next: string): Promise<string | null> {
	const { error } = await supabase.auth.signInWithOAuth({
		provider: 'apple',
		options: {
			redirectTo: getRedirectUrl(next)
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
