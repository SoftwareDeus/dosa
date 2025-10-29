import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

export function initializeCapacitor(): void {
    if (!Capacitor.isNativePlatform()) return;

    const handleUrl = (incomingUrl: string): void => {
        try {
            const url = new URL(incomingUrl);
            const path = url.pathname;
            const searchParams = url.search;
            const hash = url.hash;
            const fullPath = `${path}${searchParams}${hash}`;
            window.location.replace(fullPath);
        } catch (error) {
            console.error('Error handling deep link:', error);
        }
    };

    void App.getLaunchUrl().then((res) => { if (res?.url) handleUrl(res.url); }).catch(() => {});
    App.addListener('appUrlOpen', (data: { url: string }) => handleUrl(data.url));
}


