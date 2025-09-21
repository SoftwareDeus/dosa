<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Capacitor } from '@capacitor/core';
	import { supabase } from '$lib/supabase/client';
	import { logger } from '$lib/logger';

	export let form: { message?: string } | undefined;
	export let data: { error?: string; message?: string } = {};

	let isLogin = true;
	let isLoading = false;

	function toggleMode() {
		isLogin = !isLogin;
	}

	async function signInWithGoogle() {
		isLoading = true;
		try {
			const { error } = await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					redirectTo: `${window.location.origin}/auth/callback`
				}
			});
			if (error) throw error;
		} catch (error) {
			logger.error('Google login error', {
				error: error instanceof Error ? error.message : String(error)
			});
		} finally {
			isLoading = false;
		}
	}

	async function signInWithApple() {
		isLoading = true;
		try {
			// Use web OAuth for Apple Sign In
			const { error } = await supabase.auth.signInWithOAuth({
				provider: 'apple',
				options: {
					redirectTo: `${window.location.origin}/auth/callback`
				}
			});
			if (error) throw error;
		} catch (error) {
			logger.error('Apple login error', {
				error: error instanceof Error ? error.message : String(error)
			});
			// Show error message to user
			form = { message: 'Apple Sign In fehlgeschlagen. Bitte versuche es erneut.' };
		} finally {
			isLoading = false;
		}
	}

	let isIOS = false;
	let showAppleSignIn = true;

	onMount(async () => {
		// Wait a bit for auth to initialize
		await new Promise((resolve) => setTimeout(resolve, 100));

		// Check if user is already authenticated
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (user) {
			logger.navigation('User already authenticated, redirecting to app');
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			goto('/app');
			return;
		}

		// Check if we're on iOS for Apple Sign In
		isIOS = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';

		// Check if Apple Sign In is available
		if (isIOS) {
			// Apple Sign In is available on iOS
			showAppleSignIn = true;
		} else {
			// Check if we're on a web browser that supports Apple Sign In
			showAppleSignIn =
				/iPad|iPhone|iPod/.test(navigator.userAgent) ||
				(navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome'));
		}
	});
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 p-4">
	<div class="w-full max-w-md">
		<div class="rounded-xl bg-white p-8 shadow-lg">
			<!-- Header -->
			<div class="mb-8 text-center">
				<h1 class="mb-2 text-3xl font-bold text-gray-900">
					{isLogin ? 'Willkommen zurück' : 'Konto erstellen'}
				</h1>
				<p class="text-gray-600">
					{isLogin ? 'Melde dich in deinem Konto an' : 'Erstelle ein neues Konto'}
				</p>
			</div>

			<!-- Error Message -->
			{#if form?.message || data?.error || data?.message}
				<div class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
					<p class="text-sm text-red-600">
						{form?.message || data?.error || data?.message}
					</p>
				</div>
			{/if}

			<!-- Social Login Buttons -->
			<div class="mb-6 space-y-3">
				<button
					on:click={signInWithGoogle}
					disabled={isLoading}
					class="flex w-full items-center justify-center rounded-lg border border-gray-300 px-4 py-3 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
				>
					<svg class="mr-3 h-5 w-5" viewBox="0 0 24 24">
						<path
							fill="#4285F4"
							d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
						/>
						<path
							fill="#34A853"
							d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
						/>
						<path
							fill="#FBBC05"
							d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
						/>
						<path
							fill="#EA4335"
							d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
						/>
					</svg>
					Mit Google {isLogin ? 'anmelden' : 'registrieren'}
				</button>

				{#if showAppleSignIn}
					<button
						on:click={signInWithApple}
						disabled={isLoading}
						class="flex w-full items-center justify-center rounded-lg border border-gray-300 px-4 py-3 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<svg class="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
							/>
						</svg>
						Mit Apple {isLogin ? 'anmelden' : 'registrieren'}
					</button>
				{/if}
			</div>

			<!-- Divider -->
			<div class="relative mb-6">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-gray-300"></div>
				</div>
				<div class="relative flex justify-center text-sm">
					<span class="bg-white px-2 text-gray-500">oder</span>
				</div>
			</div>

			<!-- Email/Password Form -->
			<form method="post" use:enhance>
				<input type="hidden" name="action" value={isLogin ? 'login' : 'register'} />

				<div class="space-y-4">
					<div>
						<label for="email" class="mb-1 block text-sm font-medium text-gray-700">
							E-Mail-Adresse
						</label>
						<input
							id="email"
							name="email"
							type="email"
							required
							class="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
							placeholder="deine@email.com"
						/>
					</div>

					<div>
						<label for="password" class="mb-1 block text-sm font-medium text-gray-700">
							Passwort
						</label>
						<input
							id="password"
							name="password"
							type="password"
							required
							class="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
							placeholder="••••••••"
						/>
					</div>

					{#if !isLogin}
						<div>
							<label for="confirmPassword" class="mb-1 block text-sm font-medium text-gray-700">
								Passwort bestätigen
							</label>
							<input
								id="confirmPassword"
								name="confirmPassword"
								type="password"
								required
								class="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
								placeholder="••••••••"
							/>
						</div>
					{/if}
				</div>

				<button
					type="submit"
					disabled={isLoading}
					class="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{isLoading ? 'Wird verarbeitet...' : isLogin ? 'Anmelden' : 'Registrieren'}
				</button>
			</form>

			<!-- Toggle Mode -->
			<div class="mt-6 text-center">
				<button on:click={toggleMode} class="text-sm font-medium text-blue-600 hover:text-blue-700">
					{isLogin ? 'Noch kein Konto? Jetzt registrieren' : 'Bereits ein Konto? Jetzt anmelden'}
				</button>
			</div>
		</div>
	</div>
</div>
