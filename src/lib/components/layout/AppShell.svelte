<script lang="ts">
  import { onMount } from 'svelte';
  import { StatusBar, Style } from '@capacitor/status-bar';
  import { Capacitor } from '@capacitor/core';
  import { setupAuthListener } from '$lib/stores/auth';
  import { logger } from '$lib/logger';
  import { m } from '$lib/paraglide/messages.js';
  import NavBar from './NavBar.svelte';

  export let user: { id: string; email: string } | null | undefined;

  onMount(async (): Promise<void> => {
    // Only setup auth listener, don't initialize here
    setupAuthListener();

    if (Capacitor.isNativePlatform?.()) {
      try {
        await StatusBar.setStyle({ style: Style.Default });
      } catch (error) {
        logger.error('StatusBar error', {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  });
</script>

<div class="flex h-screen flex-col">
  <main class="flex-1 overflow-y-auto">
    <slot />
  </main>

  <!-- User info bar (only show if authenticated) -->
  {#if user}
    <div class="border-t border-gray-100 bg-gray-50 px-4 py-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <div class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
            <span class="text-xs font-medium text-white">
              {user.email.charAt(0).toUpperCase()}
            </span>
          </div>
          <span class="text-sm text-gray-700">{user.email}</span>
        </div>
        <a href="/logout" class="text-xs text-gray-500 transition-colors hover:text-red-600">
          {m.user_bar_logout()}
        </a>
      </div>
    </div>
  {/if}

  <NavBar />
</div>

<style>
  main {
    -webkit-overflow-scrolling: touch;
  }
  @supports (-webkit-touch-callout: none) {
    .h-screen {
      height: -webkit-fill-available;
    }
  }
</style>


