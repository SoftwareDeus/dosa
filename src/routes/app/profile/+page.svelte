<script lang="ts">
	import type { PageData } from './$types';
	import { Profile } from '$lib/components';
	export let data: PageData;
</script>

<Profile {data} />
