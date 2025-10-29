import { Capacitor } from '@capacitor/core';
import { AppLauncher } from '@capacitor/app-launcher';
import { supabase } from '$lib/supabase/client';
import { logger } from '$lib/logger';
import { getRedirectUrl } from '$lib/config';

export async function signInWithGoogle(_origin: string, next: string): Promise<void> {
    const redirectUrl = getRedirectUrl(next);
    const options: any = {
        redirectTo: redirectUrl,
        flowType: 'pkce' as const,
        skipBrowserRedirect: true
    };
    const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: options as any });
    if (error) throw error;
    if (data.url) {
        if (Capacitor.isNativePlatform()) {
            await AppLauncher.openUrl({ url: data.url });
        } else if (typeof window !== 'undefined') {
            window.location.assign(data.url);
        }
    }
}

export async function signInWithApple(_origin: string, next: string): Promise<string | null> {
    const redirectTo = getRedirectUrl(next);
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: { redirectTo, flowType: 'pkce' as any, skipBrowserRedirect: true } as any
    });
    if (error) {
        logger.error('Apple login error', { error: error.message });
        return 'Mit Apple anmelden fehlgeschlagen';
    }
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


