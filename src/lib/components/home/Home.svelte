<script lang="ts">
  import { m } from '$lib/paraglide/messages.js';
</script>

<div class="min-h-full bg-gray-50">
  <div class="p-6">
    <h1 class="mb-6 text-3xl font-bold text-gray-900">{m.nav_home()}</h1>

    <div class="space-y-4">
      <div class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 class="mb-3 text-xl font-semibold text-gray-800">{m.home_welcome_title()}</h2>
        <p class="text-gray-600">{m.home_welcome_sub()}</p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="rounded-xl bg-blue-500 p-4 text-white">
          <div class="text-2xl font-bold">24</div>
          <div class="text-sm opacity-90">{m.home_total_items()}</div>
        </div>
        <div class="rounded-xl bg-green-500 p-4 text-white">
          <div class="text-2xl font-bold">3</div>
          <div class="text-sm opacity-90">{m.home_categories()}</div>
        </div>
      </div>

      <div class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 class="mb-3 text-lg font-semibold">{m.home_recent()}</h3>
        <div class="space-y-2">
          <div class="flex items-center justify-between py-2">
            <span class="text-gray-700">{m.home_recent_item_coffee()}</span>
            <span class="text-xs text-gray-500">{m.time_2min()}</span>
          </div>
          <div class="flex items-center justify-between py-2">
            <span class="text-gray-700">{m.home_recent_item_speaker()}</span>
            <span class="text-xs text-gray-500">{m.time_1h()}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>


