<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	onMount(async (): Promise<void> => {
		// Parse URL hash for implicit tokens
		const FIRST_CHAR_INDEX = 1;
		const hash = new URLSearchParams(window.location.hash.slice(FIRST_CHAR_INDEX));
		const access_token = hash.get('access_token') || undefined;
		const refresh_token =
			hash.get('refresh_token') || hash.get('provider_refresh_token') || undefined;
		const next = $page.url.searchParams.get('next') || '/app';

		try {
			await fetch('/api/auth/complete', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ access_token, refresh_token, next })
			});
		} catch {
			// ignore
		}

		// Redirect regardless; server cookies should be set now (if possible)
		window.location.replace(next);
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
