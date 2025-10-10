<script lang="ts">
  import { m } from '$lib/paraglide/messages.js';
</script>

<div class="min-h-full bg-gray-50">
  <div class="p-6">
    <h1 class="mb-6 text-3xl font-bold text-gray-900">{m.favorites_title()}</h1>

    <div class="space-y-4">
      <!-- Favorite Items List -->
      <div class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 class="mb-4 text-lg font-semibold">{m.favorites_your_items()}</h2>

        <div class="space-y-3">
          <div class="flex items-center justify-between rounded-lg bg-gray-50 p-3 hover:bg-gray-100">
            <div class="flex items-center space-x-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white">📱</div>
              <div>
                <div class="font-medium text-gray-900">{m.fav_item_charger()}</div>
                <div class="text-sm text-gray-500">{m.fav_item_category_electronics()}</div>
              </div>
            </div>
            <button class="text-red-500 hover:text-red-600"> ❤️ </button>
          </div>

          <div class="flex items-center justify-between rounded-lg bg-gray-50 p-3 hover:bg-gray-100">
            <div class="flex items-center space-x-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500 text-white">☕</div>
              <div>
                <div class="font-medium text-gray-900">{m.fav_item_coffee_mug()}</div>
                <div class="text-sm text-gray-500">{m.fav_item_category_kitchen()}</div>
              </div>
            </div>
            <button class="text-red-500 hover:text-red-600"> ❤️ </button>
          </div>

          <div class="flex items-center justify-between rounded-lg bg-gray-50 p-3 hover:bg-gray-100">
            <div class="flex items-center space-x-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500 text-white">🔑</div>
              <div>
                <div class="font-medium text-gray-900">{m.fav_item_house_keys()}</div>
                <div class="text-sm text-gray-500">{m.fav_item_category_personal()}</div>
              </div>
            </div>
            <button class="text-red-500 hover:text-red-600"> ❤️ </button>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 class="mb-3 text-lg font-semibold">{m.favorites_quick_stats()}</h2>
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold text-red-500">3</div>
            <div class="text-sm text-gray-500">{m.favorites_label()}</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-blue-500">2</div>
            <div class="text-sm text-gray-500">{m.stats_categories()}</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-green-500">1</div>
            <div class="text-sm text-gray-500">{m.stats_this_week()}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>


