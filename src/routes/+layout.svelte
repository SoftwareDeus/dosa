<script lang="ts">
	import type { LayoutData } from './$types';
	import '../app.css';
	import { AppShell } from '$lib/components';

	export let data: LayoutData & {
		user?: { id: string; email: string } | null;
	};
</script>

<AppShell user={data.user}>
	<slot />
</AppShell>
