<script lang="ts">
	import type { PageData } from './$types';
    import { m } from '$lib/paraglide/messages.js';

	export let data: PageData;
</script>

{#if data.user}
	<section class="p-4">
        <h1 class="text-xl font-semibold">{m.app_welcome()}</h1>
        <p class="text-sm text-gray-600">{m.app_signed_in_as({ email: data.user.email ?? '' })}</p>
	</section>
{:else}
	<section class="p-4">
        <h1 class="text-xl font-semibold">{m.app_not_auth()}</h1>
        <p class="text-sm text-gray-600">{m.app_redirect_login()}</p>
	</section>
{/if}
