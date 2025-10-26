import { Capacitor } from '@capacitor/core';
import { AppLauncher } from '@capacitor/app-launcher';
import { supabase } from '$lib/supabase/client';
import { logger } from '$lib/logger';
import { getRedirectUrl } from '$lib/config';
import { env as publicEnv } from '$env/dynamic/public';

export async function signInWithGoogle(_origin: string, next: string): Promise<void> {
    const useWebCallback = publicEnv.PUBLIC_OAUTH_DEV_WEB_CALLBACK === 'true';
    const webOrigin = publicEnv.PUBLIC_WEB_ORIGIN || 'http://localhost:5173';
    const redirectUrl = Capacitor.isNativePlatform() && useWebCallback
        ? `${webOrigin}/auth/callback?next=${encodeURIComponent(next || '/app')}`
        : getRedirectUrl(next);
	console.log('🔗 OAuth redirect URL:', redirectUrl);
	
    const options: any = {
        redirectTo: redirectUrl,
        flowType: 'pkce' as const,
        // Always manual redirect to avoid browser auto-redirect quirks
        skipBrowserRedirect: true
    };
    
    const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: options as any });
	if (error) throw error;
	
	console.log('🔗 OAuth URL to open:', data.url);
	
    // Open OAuth URL explicitly
    if (data.url) {
        if (Capacitor.isNativePlatform()) {
            await AppLauncher.openUrl({ url: data.url });
        } else if (typeof window !== 'undefined') {
            window.location.assign(data.url);
        }
    }
}

export async function signInWithApple(_origin: string, next: string): Promise<string | null> {
    const useWebCallback = publicEnv.PUBLIC_OAUTH_DEV_WEB_CALLBACK === 'true';
    const webOrigin = publicEnv.PUBLIC_WEB_ORIGIN || 'http://localhost:5173';
    const redirectTo = Capacitor.isNativePlatform() && useWebCallback
        ? `${webOrigin}/auth/callback?next=${encodeURIComponent(next || '/app')}`
        : getRedirectUrl(next);

    const { data, error } = await supabase.auth.signInWithOAuth({
		provider: 'apple',
        options: {
            redirectTo,
            // Keep PKCE; force manual redirect for consistency
            flowType: 'pkce' as any,
			skipBrowserRedirect: true
        } as any
	});
	if (error) {
		logger.error('Apple login error', { error: error.message });
		return 'Mit Apple anmelden fehlgeschlagen';
	}
	
    // On native platforms, open the OAuth URL in the phone's browser (outside the app)
    if (data.url) {
        if (Capacitor.isNativePlatform()) {
            await AppLauncher.openUrl({ url: data.url });
        } else if (typeof window !== 'undefined') {
            window.location.assign(data.url);
        }
    }
	
	return null;
}

export function shouldShowAppleSignIn(): boolean {
	const isIOS = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
	if (isIOS) return true;
	const ua = navigator.userAgent;
	return /iPad|iPhone|iPod/.test(ua) || (ua.includes('Safari') && !ua.includes('Chrome'));
}
