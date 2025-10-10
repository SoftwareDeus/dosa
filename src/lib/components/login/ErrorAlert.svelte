<script lang="ts">
	export let message: string | undefined;
</script>

{#if message}
	<div class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
		<p class="text-sm text-red-600">{message}</p>
	</div>
{/if}


