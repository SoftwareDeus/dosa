<script lang="ts">
	import { AiSubNav } from '$lib/components';
</script>

<div class="flex h-full flex-col">
	<AiSubNav />
	<div class="flex-1 overflow-y-auto">
		<slot />
	</div>
</div>
