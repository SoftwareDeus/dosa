<script lang="ts">
  import { page } from '$app/stores';
  import { resolve } from '$app/paths';
  import { m } from '$lib/paraglide/messages.js';

  function isActive(path: string): boolean {
    const p = $page.url.pathname;
    return p === path || p.startsWith(path + '/');
  }
</script>

<div class="border-b border-gray-200 bg-white shadow-sm">
  <div class="flex overflow-x-auto">
    <a
      href={resolve('/app/ai')}
      aria-current={$page.url.pathname === '/app/ai' ? 'page' : undefined}
      class="flex-shrink-0 border-b-2 px-6 py-3 text-sm font-medium transition-colors {$page.url
        .pathname === '/app/ai'
        ? 'border-purple-600 text-purple-600'
        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
    >
      💬 {m.nav_ai_chat()}
    </a>
    <a
      href={resolve('/app/ai/vision')}
      aria-current={isActive('/app/ai/vision') ? 'page' : undefined}
      class="flex-shrink-0 border-b-2 px-6 py-3 text-sm font-medium transition-colors {isActive('/app/ai/vision')
        ? 'border-purple-600 text-purple-600'
        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
    >
      👁️ {m.nav_ai_vision()}
    </a>
    <a
      href={resolve('/app/ai/tools')}
      aria-current={isActive('/app/ai/tools') ? 'page' : undefined}
      class="flex-shrink-0 border-b-2 px-6 py-3 text-sm font-medium transition-colors {isActive('/app/ai/tools')
        ? 'border-purple-600 text-purple-600'
        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
    >
      🛠️ {m.nav_ai_tools()}
    </a>
    <a
      href={resolve('/app/ai/health')}
      aria-current={isActive('/app/ai/health') ? 'page' : undefined}
      class="flex-shrink-0 border-b-2 px-6 py-3 text-sm font-medium transition-colors {isActive('/app/ai/health')
        ? 'border-purple-600 text-purple-600'
        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
    >
      🏥 {m.nav_ai_health()}
    </a>
  </div>
</div>


