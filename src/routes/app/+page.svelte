<script lang="ts">
	import type { PageData } from './$types';
	import { AppLanding } from '$lib/components';
	export let data: PageData;
</script>

<AppLanding {data} />
