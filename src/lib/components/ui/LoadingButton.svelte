<script lang="ts">
  export let loading: boolean = false;
  export let disabled: boolean = false;
  export let className: string = '';
</script>

<button class={className} disabled={disabled || loading}>
  {#if loading}
    <span class="flex items-center justify-center gap-2">
      <span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
      <slot name="loading">Lädt...</slot>
    </span>
  {:else}
    <slot />
  {/if}
</button>


