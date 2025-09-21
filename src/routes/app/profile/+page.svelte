<script lang="ts">
	// import { goto } from '$app/navigation';
	// import { supabase } from '$lib/supabase/client';
	// import { authStore } from '$lib/stores/auth';
	import { logger } from '$lib/logger';
	import type { PageData } from './$types';

	export let data: PageData;

	let isLoggingOut = false;

	async function handleLogout() {
		if (isLoggingOut) return; // Prevent double clicks

		isLoggingOut = true;

		try {
			logger.navigation('Redirecting to logout route...');
			// Simply redirect to logout route - let it handle everything
			window.location.href = '/logout';
		} catch (error) {
			logger.error('Logout redirect error', {
				error: error instanceof Error ? error.message : String(error)
			});
			// Fallback redirect
			window.location.href = '/login';
		} finally {
			isLoggingOut = false;
		}
	}
</script>

<div class="min-h-full bg-gray-50">
	<div class="p-6">
		<h1 class="mb-6 text-3xl font-bold text-gray-900">Profile</h1>

		<div class="space-y-4">
			<!-- User Info -->
			<div class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
				<div class="mb-4 flex items-center space-x-4">
					<div
						class="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-2xl text-white"
					>
						👤
					</div>
					<div>
						<h2 class="text-xl font-semibold text-gray-900">
							{data.user.email?.split('@')[0] || 'Benutzer'}
						</h2>
						<p class="text-gray-600">{data.user.email}</p>
					</div>
				</div>
				<button class="w-full rounded-lg bg-blue-500 py-2 text-white hover:bg-blue-600">
					Edit Profile
				</button>
			</div>

			<!-- Settings -->
			<div class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
				<h3 class="mb-4 text-lg font-semibold">Settings</h3>
				<div class="space-y-3">
					<button
						class="flex w-full items-center justify-between rounded-lg bg-gray-50 p-3 hover:bg-gray-100"
					>
						<div class="flex items-center space-x-3">
							<span class="text-xl">🔔</span>
							<span class="font-medium">Notifications</span>
						</div>
						<span class="text-gray-400">›</span>
					</button>

					<button
						class="flex w-full items-center justify-between rounded-lg bg-gray-50 p-3 hover:bg-gray-100"
					>
						<div class="flex items-center space-x-3">
							<span class="text-xl">🔒</span>
							<span class="font-medium">Privacy</span>
						</div>
						<span class="text-gray-400">›</span>
					</button>

					<button
						class="flex w-full items-center justify-between rounded-lg bg-gray-50 p-3 hover:bg-gray-100"
					>
						<div class="flex items-center space-x-3">
							<span class="text-xl">💾</span>
							<span class="font-medium">Backup & Sync</span>
						</div>
						<span class="text-gray-400">›</span>
					</button>

					<button
						class="flex w-full items-center justify-between rounded-lg bg-gray-50 p-3 hover:bg-gray-100"
					>
						<div class="flex items-center space-x-3">
							<span class="text-xl">ℹ️</span>
							<span class="font-medium">About</span>
						</div>
						<span class="text-gray-400">›</span>
					</button>
				</div>
			</div>

			<!-- Account Stats -->
			<div class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
				<h3 class="mb-4 text-lg font-semibold">Account Stats</h3>
				<div class="grid grid-cols-2 gap-4">
					<div class="text-center">
						<div class="text-2xl font-bold text-blue-500">24</div>
						<div class="text-sm text-gray-500">Items Added</div>
					</div>
					<div class="text-center">
						<div class="text-2xl font-bold text-green-500">30</div>
						<div class="text-sm text-gray-500">Days Active</div>
					</div>
				</div>
			</div>

			<!-- Actions -->
			<div class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
				<div class="space-y-3">
					<button class="w-full rounded-lg bg-gray-100 py-3 text-gray-700 hover:bg-gray-200">
						Export Data
					</button>
					<button
						on:click={handleLogout}
						disabled={isLoggingOut}
						class="w-full rounded-lg py-3 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50
						       {isLoggingOut ? 'bg-red-400' : 'bg-red-500 hover:bg-red-600'}"
					>
						{isLoggingOut ? 'Wird abgemeldet...' : 'Abmelden'}
					</button>
				</div>
			</div>
		</div>
	</div>
</div>
