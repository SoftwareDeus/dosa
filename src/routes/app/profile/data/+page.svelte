<script lang="ts">
	import type { PageData } from './$types';
	import { ProfileData } from '$lib/components';
	export let data: PageData;
</script>

<ProfileData {data} />
