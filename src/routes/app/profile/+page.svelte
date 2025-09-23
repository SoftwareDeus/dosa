<script lang="ts">
	// import { goto } from '$app/navigation';
	// import { supabase } from '$lib/supabase/client';
	// import { authStore } from '$lib/stores/auth';
	import { logger } from '$lib/logger';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';
	import { m } from '$lib/paraglide/messages.js';
	import { setLocale } from '$lib/paraglide/runtime';
	// import { onMount } from 'svelte';

	export let data: PageData;

	let isLoggingOut = false;
	let showData = false;
	let isEditing = false;
	let loadingData = false;
	let loadError: string | null = null;
	let lastTs = '';
	let me: Record<string, unknown> | null = null;
	let formName = '';
	let formPhone = '';
	let formAvatarUrl = '';
	const JSON_SPACE = 2;

	async function handleLogout(): Promise<void> {
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

	async function fetchData(): Promise<void> {
		loadingData = true;
		loadError = null;
		try {
			const res = await fetch('/api/me');
			const j = await res.json();
			if (!j.ok) throw new Error(j.error || 'failed');
			me = j.data;
			lastTs = j.ts;
			// Pre-fill edit form with best-effort name/phone/avatar
			const googleName = me?.google?.names?.[0]?.displayName as string | undefined;
			formName = googleName || data.user.email?.split('@')[0] || '';
			const googlePhone = me?.google?.phoneNumbers?.[0]?.value as string | undefined;
			formPhone = googlePhone || '';
			const googlePhoto = me?.google?.photos?.[0]?.url as string | undefined;
			formAvatarUrl = googlePhoto || '';
		} catch (e) {
			loadError = e instanceof Error ? e.message : String(e);
		} finally {
			loadingData = false;
		}
	}

	function _toggleData(): void {
		showData = !showData;
		if (showData && !me && !loadingData) fetchData();
	}

	async function saveProfile(): Promise<void> {
		// Placeholder: hook into your backend/update route if available
		// For now, just close edit mode
		isEditing = false;
		// eslint-disable-next-line no-alert
		alert(m.update_success());
	}
</script>

<div class="min-h-full bg-gray-50">
	<div class="p-6">
		<h1 class="mb-6 text-3xl font-bold text-gray-900">{m.profile_title()}</h1>

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
							{data.user.email?.split('@')[0] || m.profile_default_name()}
						</h2>
						<p class="text-gray-600">{data.user.email}</p>
					</div>
				</div>
				<a
					href={resolve('/app/profile/data')}
					class="block w-full rounded-lg bg-blue-500 py-2 text-center text-white hover:bg-blue-600"
				>
					{m.profile_edit()}
				</a>
			</div>

			<!-- Settings -->
			<div class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
				<h3 class="mb-4 text-lg font-semibold">{m.profile_settings()}</h3>
				<div class="space-y-3">
					<button
						class="flex w-full items-center justify-between rounded-lg bg-gray-50 p-3 hover:bg-gray-100"
					>
						<div class="flex items-center space-x-3">
							<span class="text-xl">🔔</span>
							<span class="font-medium">{m.profile_notifications()}</span>
						</div>
						<span class="text-gray-400">›</span>
					</button>

					<button
						class="flex w-full items-center justify-between rounded-lg bg-gray-50 p-3 hover:bg-gray-100"
					>
						<div class="flex items-center space-x-3">
							<span class="text-xl">🔒</span>
							<span class="font-medium">{m.profile_privacy()}</span>
						</div>
						<span class="text-gray-400">›</span>
					</button>

					<button
						class="flex w-full items-center justify-between rounded-lg bg-gray-50 p-3 hover:bg-gray-100"
					>
						<div class="flex items-center space-x-3">
							<span class="text-xl">💾</span>
							<span class="font-medium">{m.profile_backup()}</span>
						</div>
						<span class="text-gray-400">›</span>
					</button>

					<div class="flex w-full items-center justify-between rounded-lg bg-gray-50 p-3">
						<div class="flex items-center space-x-3">
							<span class="text-xl">🌐</span>
							<span class="font-medium">{m.profile_language()}</span>
						</div>
						<div class="flex items-center gap-2">
							<button
								class="rounded-md border bg-white px-3 py-1 text-sm hover:bg-gray-100"
								on:click={() => setLocale('en')}>{m.language_en()}</button
							>
							<button
								class="rounded-md border bg-white px-3 py-1 text-sm hover:bg-gray-100"
								on:click={() => setLocale('de-de')}>{m.language_de()}</button
							>
						</div>
					</div>

					<button
						class="flex w-full items-center justify-between rounded-lg bg-gray-50 p-3 hover:bg-gray-100"
					>
						<div class="flex items-center space-x-3">
							<span class="text-xl">ℹ️</span>
							<span class="font-medium">{m.profile_about()}</span>
						</div>
						<span class="text-gray-400">›</span>
					</button>
				</div>
			</div>

			<!-- Account Stats -->
			<div class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
				<h3 class="mb-4 text-lg font-semibold">{m.profile_stats()}</h3>
				<div class="grid grid-cols-2 gap-4">
					<div class="text-center">
						<div class="text-2xl font-bold text-blue-500">24</div>
						<div class="text-sm text-gray-500">{m.profile_items_added()}</div>
					</div>
					<div class="text-center">
						<div class="text-2xl font-bold text-green-500">30</div>
						<div class="text-sm text-gray-500">{m.profile_days_active()}</div>
					</div>
				</div>
			</div>

			<!-- Actions -->
			<div class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
				<div class="space-y-3">
					<button class="w-full rounded-lg bg-gray-100 py-3 text-gray-700 hover:bg-gray-200">
						{m.profile_export()}
					</button>
					<button
						on:click={handleLogout}
						disabled={isLoggingOut}
						class="w-full rounded-lg py-3 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50
						       {isLoggingOut ? 'bg-red-400' : 'bg-red-500 hover:bg-red-600'}"
					>
						{isLoggingOut ? m.profile_logging_out() : m.profile_sign_out()}
					</button>
				</div>
			</div>

			{#if showData}
				<div class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
					{#if loadingData}
						<div class="text-sm text-gray-500">{m.processing()}</div>
					{:else if loadError}
						<div class="text-sm text-red-600">{m.error_loading_data()}</div>
					{:else if me}
						<div class="mb-2 text-xs text-gray-500">{m.data_last_refreshed({ ts: lastTs })}</div>
						<h4 class="mb-2 text-sm font-semibold">{m.data_section_account()}</h4>
						<pre class="mb-4 overflow-auto rounded bg-gray-50 p-3 text-xs">{JSON.stringify(
								me.user,
								null,
								JSON_SPACE
							)}</pre>
						<h4 class="mb-2 text-sm font-semibold">{m.data_section_google()}</h4>
						<pre class="mb-4 overflow-auto rounded bg-gray-50 p-3 text-xs">{JSON.stringify(
								me.google ?? {},
								null,
								JSON_SPACE
							)}</pre>

						<div class="mt-4">
							<button
								class="rounded bg-blue-600 px-3 py-2 text-sm text-white"
								on:click={() => (isEditing = !isEditing)}
							>
								{m.profile_edit_data()}
							</button>
						</div>

						{#if isEditing}
							<form class="mt-3 space-y-3" on:submit|preventDefault={saveProfile}>
								<div>
									<label class="mb-1 block text-sm text-gray-700" for="name">{m.field_name()}</label
									>
									<input id="name" class="w-full rounded border px-2 py-1" bind:value={formName} />
								</div>
								<div>
									<label class="mb-1 block text-sm text-gray-700" for="phone"
										>{m.field_phone()}</label
									>
									<input
										id="phone"
										class="w-full rounded border px-2 py-1"
										bind:value={formPhone}
									/>
								</div>
								<div>
									<label class="mb-1 block text-sm text-gray-700" for="avatar"
										>{m.field_avatar_url()}</label
									>
									<input
										id="avatar"
										class="w-full rounded border px-2 py-1"
										bind:value={formAvatarUrl}
									/>
								</div>
								<div class="flex gap-2">
									<button class="rounded bg-blue-600 px-3 py-2 text-sm text-white" type="submit"
										>{m.profile_save()}</button
									>
									<button
										class="rounded bg-gray-200 px-3 py-2 text-sm"
										type="button"
										on:click={() => (isEditing = false)}>{m.profile_cancel()}</button
									>
								</div>
							</form>
						{/if}
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>
