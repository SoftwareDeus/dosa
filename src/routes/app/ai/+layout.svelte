<script lang="ts">
	import { page } from '$app/stores';
	import { m } from '$lib/paraglide/messages.js';

	// use $page directly in markup for reactivity on client navigation
</script>

<div class="flex h-full flex-col">
	<!-- AI Sub-Navigation -->
	<div class="border-b border-gray-200 bg-white shadow-sm">
		<div class="flex overflow-x-auto">
			<a
				href="/app/ai"
				aria-current={$page.url.pathname === '/app/ai' ? 'page' : undefined}
				class="flex-shrink-0 border-b-2 px-6 py-3 text-sm font-medium transition-colors {$page.url.pathname === '/app/ai'
					? 'border-purple-600 text-purple-600'
					: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
			>
				💬 {m.nav_ai_chat()}
			</a>
			<a
				href="/app/ai/vision"
				aria-current={$page.url.pathname === '/app/ai/vision' || $page.url.pathname.startsWith('/app/ai/vision/') ? 'page' : undefined}
				class="flex-shrink-0 border-b-2 px-6 py-3 text-sm font-medium transition-colors {$page.url.pathname === '/app/ai/vision' || $page.url.pathname.startsWith('/app/ai/vision/')
					? 'border-purple-600 text-purple-600'
					: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
			>
				👁️ {m.nav_ai_vision()}
			</a>
			<a
				href="/app/ai/tools"
				aria-current={$page.url.pathname === '/app/ai/tools' || $page.url.pathname.startsWith('/app/ai/tools/') ? 'page' : undefined}
				class="flex-shrink-0 border-b-2 px-6 py-3 text-sm font-medium transition-colors {$page.url.pathname === '/app/ai/tools' || $page.url.pathname.startsWith('/app/ai/tools/')
					? 'border-purple-600 text-purple-600'
					: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
			>
				🛠️ {m.nav_ai_tools()}
			</a>
		</div>
	</div>

	<!-- AI Page Content -->
	<div class="flex-1 overflow-y-auto">
		<slot />
	</div>
</div>

