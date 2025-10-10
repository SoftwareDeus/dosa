<script lang="ts">
  export let icon: string | undefined;
  export let title: string;
  export let subtitle: string | undefined;
</script>

<div class="rounded-xl bg-white p-6 shadow-sm">
  <div class="flex items-center gap-3">
    {#if icon}
      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <span class="text-2xl">{icon}</span>
      </div>
    {/if}
    <div>
      <h1 class="text-2xl font-bold text-gray-900">{title}</h1>
      {#if subtitle}
        <p class="text-sm text-gray-500">{subtitle}</p>
      {/if}
    </div>
  </div>
  <slot />
  </div>


