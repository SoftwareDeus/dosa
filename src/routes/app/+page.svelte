<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;
</script>

{#if data.user}
  <section class="p-4">
    <h1 class="text-xl font-semibold">Welcome 👋</h1>
    <p class="text-sm text-gray-600">Angemeldet als {data.user.email}</p>
  </section>
{:else}
  <section class="p-4">
    <h1 class="text-xl font-semibold">Not authenticated</h1>
    <p class="text-sm text-gray-600">Redirecting to login...</p>
  </section>
{/if}
