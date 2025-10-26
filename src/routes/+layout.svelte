<script lang="ts">
	import type { LayoutData } from './$types';
	import '../app.css';
	import { AppShell } from '$lib/components';
	import { onMount } from 'svelte';
	import { initializeCapacitor } from '$lib/capacitor-init';

	export let data: LayoutData & {
		user?: { id: string; email: string } | null;
	};

	// Initialize Capacitor deep link handling on mount
	onMount(() => {
		initializeCapacitor();
	});
</script>

<AppShell user={data.user}>
	<slot />
</AppShell>
