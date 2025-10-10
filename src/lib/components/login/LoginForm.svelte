<script lang="ts">
	import { enhance } from '$app/forms';
	import { m } from '$lib/paraglide/messages.js';
	import { createEventDispatcher } from 'svelte';

	export let isLogin: boolean;
	const dispatch = createEventDispatcher<{ toggle: void }>();

	function toggleMode(): void {
		dispatch('toggle');
	}
</script>

<form method="post" use:enhance>
	<input type="hidden" name="action" value={isLogin ? 'login' : 'register'} />

	<div class="space-y-4">
		<div>
			<label for="email" class="mb-1 block text-sm font-medium text-gray-700">
				{m.email_label()}
			</label>
			<input
				id="email"
				name="email"
				type="email"
				required
				class="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
				placeholder={m.email_placeholder()}
			/>
		</div>

		<div>
			<label for="password" class="mb-1 block text-sm font-medium text-gray-700">
				{m.password_label()}
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
					{m.password_confirm_label()}
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
	class="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
>
	{isLogin ? m.btn_login() : m.btn_register()}
</button>
</form>

<div class="mt-6 text-center">
	<button on:click={toggleMode} class="text-sm font-medium text-blue-600 hover:text-blue-700">
		{isLogin ? m.toggle_to_register() : m.toggle_to_login()}
	</button>
</div>


