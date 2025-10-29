<script lang="ts">
	import type { LayoutData } from './$types';
	import '../app.css';
// Minimal layout without app shell
	import { onMount } from 'svelte';
import { initializeCapacitor } from '$lib/auth/deeplink';

	export let data: LayoutData & {
		user?: { id: string; email: string } | null;
	};

	// Initialize Capacitor deep link handling on mount
	onMount(() => {
		initializeCapacitor();
	});
</script>

<slot />
