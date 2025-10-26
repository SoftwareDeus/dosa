<script lang="ts">
	import { onMount } from 'svelte';
import { Capacitor } from '@capacitor/core';

	onMount((): void => {
		const FIRST_CHAR_INDEX = 1;
		
		// Parse the current URL - handle both web and deep link formats
		let currentUrl: URL;
		try {
			// For deep links like dosa://localhost/auth/callback?next=/app
			// window.location.href might be the deep link or a web URL
			const href = window.location.href;
			
			// If it's a deep link, convert to a parseable URL
			if (href.startsWith('dosa://')) {
				// Convert dosa://localhost/path to https://localhost/path for parsing
				currentUrl = new URL(href.replace('dosa://', 'https://'));
			} else {
				currentUrl = new URL(href);
			}
		} catch (e) {
			console.error('Failed to parse URL:', e);
			currentUrl = new URL(window.location.href);
		}
		
		const hash = new URLSearchParams(window.location.hash.slice(FIRST_CHAR_INDEX));
		const access_token = hash.get('access_token') || currentUrl.searchParams.get('access_token') || undefined;
		const refresh_token =
			hash.get('refresh_token') || currentUrl.searchParams.get('refresh_token') || hash.get('provider_refresh_token') || undefined;
		const next = currentUrl.searchParams.get('next') || '/app';

		if (!access_token && !refresh_token) {
			// If no hash tokens present, server load will handle code flow; nothing to do
			return;
		}

		void fetch('/api/auth/complete', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ access_token, refresh_token, next })
		}).finally(() => {
			// Navigate to the next page on web
			window.location.replace(next);
		});
	});
</script>

<div class="flex min-h-screen items-center justify-center">
	<div class="text-center">
		<div class="mb-4">
			<div
				class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
			></div>
		</div>
		<h2 class="text-xl font-semibold">Completing sign in...</h2>
		<p class="text-gray-600">Please wait while we finish setting up your account.</p>
	</div>
</div>
