<script lang="ts">
  import { page } from '$app/stores';
  import { m } from '$lib/paraglide/messages.js';

  type NavItem = { href: string; icon: string; label: string };
  const navItems: NavItem[] = [
    { href: '/', icon: '🏠', label: m.nav_home() },
    { href: '/app/explore', icon: '🔍', label: m.nav_explore() },
    { href: '/app/ai', icon: '🤖', label: m.nav_ai_chat() },
    { href: '/app/favorites', icon: '❤️', label: m.nav_favorites() },
    { href: '/app/profile', icon: '👤', label: m.nav_profile() }
  ];

  function isActive(href: string): boolean {
    const path = $page.url.pathname;
    return path === href || (href !== '/' && path.startsWith(href + '/'));
  }
</script>

<nav class="border-t border-gray-200 bg-white shadow-lg">
  <div class="pb-safe-bottom flex">
    {#each navItems as item (item.href)}
      <a
        href={item.href}
        aria-label={item.label}
        aria-current={isActive(item.href) ? 'page' : undefined}
        class="flex flex-1 flex-col items-center px-2 py-3 transition-all duration-200 {isActive(item.href)
          ? 'bg-blue-50 text-blue-600'
          : 'text-gray-500 hover:text-blue-600 active:scale-95'}"
      >
        <span class="mb-1 text-2xl transition-transform duration-200 {isActive(item.href) ? 'scale-110' : ''}">
          {item.icon}
        </span>
        <span class="text-xs font-medium">{item.label}</span>
      </a>
    {/each}
  </div>
</nav>

<style>
  .pb-safe-bottom {
    padding-bottom: max(env(safe-area-inset-bottom, 0px), 8px);
  }
</style>


