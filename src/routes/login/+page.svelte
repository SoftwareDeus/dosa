<script lang="ts">
	import { Login } from '$lib/components';
	export let form: { message?: string } | null;
	export let data: { error?: string; message?: string } = {};
</script>

<Login {form} {data} />
