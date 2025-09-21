<script lang=ts>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { StatusBar, Style } from '@capacitor/status-bar';
	import { Capacitor } from '@capacitor/core';
	import '../app.css';  

	let { children } = $props();

	// Native-spezifische Initialisierung
	onMount(async () => {
		if (Capacitor.isNativePlatform()) {
			try {
				await StatusBar.setStyle({ style: Style.Default });
			} catch (error) {
				console.error('StatusBar error:', error);
			}
		}
	});

	// Navigation Items
	const navItems = [
		{ href: '/', icon: '🏠', label: 'Home' },
		{ href: '/explore', icon: '🔍', label: 'Explore' },
		{ href: '/favorites', icon: '❤️', label: 'Favorites' },
		{ href: '/profile', icon: '👤', label: 'Profile' }
	];

	function isActive(href: string) {
		return $page.url.pathname === href;
	}
</script>

<div class="flex flex-col h-screen">
	<!-- Main Content -->
	<main class="flex-1 overflow-y-auto">
		{@render children()}
	</main>

	<!-- Bottom Navigation -->
	<nav class="bg-white border-t border-gray-200 shadow-lg">
		<div class="flex pb-safe-bottom">
			{#each navItems as item}
				<a
					href={item.href}
					class="flex-1 flex flex-col items-center py-3 px-2 transition-all duration-200
					       {isActive(item.href) 
					       	? 'text-blue-600 bg-blue-50' 
					       	: 'text-gray-500 hover:text-blue-600 active:scale-95'}"
					aria-label={item.label}
				>
					<span class="text-2xl mb-1 transition-transform duration-200 
					           {isActive(item.href) ? 'scale-110' : ''}">
						{item.icon}
					</span>
					<span class="text-xs font-medium">{item.label}</span>
				</a>
			{/each}
		</div>
	</nav>
</div>

<style>
	/* Safe Area Support */
	.pb-safe-bottom {
		padding-bottom: max(env(safe-area-inset-bottom, 0px), 8px);
	}

	/* Smooth scrolling */
	main {
		-webkit-overflow-scrolling: touch;
	}

	/* iOS Safari height fix */
	@supports (-webkit-touch-callout: none) {
		.h-screen {
			height: -webkit-fill-available;
		}
	}
</style>