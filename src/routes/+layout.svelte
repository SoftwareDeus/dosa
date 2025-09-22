<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { StatusBar, Style } from '@capacitor/status-bar';
	import { Capacitor } from '@capacitor/core';
	import { setupAuthListener } from '$lib/stores/auth';
	import { logger } from '$lib/logger';
	import type { LayoutData } from './$types';
	import '../app.css';

	export let data: LayoutData & {
		user?: {
			id: string;
			email: string;
		} | null;
	};

	$: currentPath = $page.url.pathname;

	type NavItem = { href: string; icon: string; label: string };
	const navItems: NavItem[] = [
		{ href: '/', icon: '🏠', label: 'Home' },
		{ href: '/app/explore', icon: '🔍', label: 'Explore' },
		{ href: '/app/favorites', icon: '❤️', label: 'Favorites' },
		{ href: '/app/profile', icon: '👤', label: 'Profile' }
	];

	onMount(async () => {
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

	function isActive(href: string) {
		return currentPath === href;
	}
</script>

<div class="flex h-screen flex-col">
	<main class="flex-1 overflow-y-auto">
		<slot />
	</main>

	<!-- User info bar (only show if authenticated) -->
	{#if data.user}
		<div class="border-t border-gray-100 bg-gray-50 px-4 py-2">
			<div class="flex items-center justify-between">
				<div class="flex items-center space-x-2">
					<div class="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
						<span class="text-xs font-medium text-white">
							{data.user.email.charAt(0).toUpperCase()}
						</span>
					</div>
					<span class="text-sm text-gray-700">{data.user.email}</span>
				</div>
				<a 
					href="/logout" 
					class="text-xs text-gray-500 hover:text-red-600 transition-colors"
				>
					Logout
				</a>
			</div>
		</div>
	{/if}

	<nav class="border-t border-gray-200 bg-white shadow-lg">
		<div class="pb-safe-bottom flex">
			{#each navItems as item (item.href)}
				<a
					href={item.href}
					aria-label={item.label}
					aria-current={isActive(item.href) ? 'page' : undefined}
					class="flex flex-1 flex-col items-center px-2 py-3 transition-all duration-200
						   {isActive(item.href)
						? 'bg-blue-50 text-blue-600'
						: 'text-gray-500 hover:text-blue-600 active:scale-95'}"
				>
					<span
						class="mb-1 text-2xl transition-transform duration-200
							   {isActive(item.href) ? 'scale-110' : ''}"
					>
						{item.icon}
					</span>
					<span class="text-xs font-medium">{item.label}</span>
				</a>
			{/each}
		</div>
	</nav>
</div>

<style>
	.pb-safe-bottom {
		padding-bottom: max(env(safe-area-inset-bottom, 0px), 8px);
	}
	main {
		-webkit-overflow-scrolling: touch;
	}
	@supports (-webkit-touch-callout: none) {
		.h-screen {
			height: -webkit-fill-available;
		}
	}
</style>
