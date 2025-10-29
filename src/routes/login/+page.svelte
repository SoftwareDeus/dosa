<script lang="ts">
  import { signInWithGoogle, signInWithApple, shouldShowAppleSignIn } from '$lib/auth/signin';
  export let form: { message?: string } | null;
  export let data: { error?: string; message?: string } = {};

  const next = '/app';

  function onGoogle() {
    void signInWithGoogle('', next);
  }

  async function onApple() {
    const err = await signInWithApple('', next);
    if (err) alert(err);
  }
</script>

<div class="min-h-screen flex items-center justify-center p-6">
  <div class="w-full max-w-sm space-y-4">
    <h1 class="text-2xl font-bold">Sign in</h1>
    {#if data?.error}
      <div class="text-red-600 text-sm">{data.error}</div>
    {/if}
    {#if data?.message}
      <div class="text-gray-700 text-sm">{data.message}</div>
    {/if}
    {#if form?.message}
      <div class="text-gray-700 text-sm">{form.message}</div>
    {/if}
    <button class="w-full border rounded px-4 py-2" on:click={onGoogle}>Sign in with Google</button>
    {#if shouldShowAppleSignIn()}
      <button class="w-full border rounded px-4 py-2" on:click={onApple}>Sign in with Apple</button>
    {/if}
  </div>
  
</div>
