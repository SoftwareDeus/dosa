import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

/**
 * Initialize Capacitor deep link handling
 * This listens for app URL open events and navigates to the appropriate route
 */
export function initializeCapacitor(): void {
	if (!Capacitor.isNativePlatform()) {
		return; // Only run on native platforms
	}

    const handleUrl = (incomingUrl: string): void => {
        console.log('App opened with URL:', incomingUrl);
        try {
            const url = new URL(incomingUrl);
            const path = url.pathname;
            const searchParams = url.search;
            const hash = url.hash;
            const fullPath = `${path}${searchParams}${hash}`;
            console.log('Navigating to:', fullPath);
            window.location.replace(fullPath);
        } catch (error) {
            console.error('Error handling deep link:', error);
        }
    };

    // 1) Handle cold start (app launched from deep link before listener is ready)
    void App.getLaunchUrl().then((res) => {
        if (res?.url) handleUrl(res.url);
    }).catch(() => {});

    // 2) Handle warm start / resumed app
    App.addListener('appUrlOpen', (data: { url: string }) => handleUrl(data.url));

	console.log('Capacitor deep link handling initialized');
}


