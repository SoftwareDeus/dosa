<script lang="ts">
  export let className: string = '';
</script>

<div class={`rounded-xl bg-white p-6 shadow-sm ${className}`}>
  <slot />
</div>


