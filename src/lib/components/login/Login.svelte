<script lang="ts">
	import { m } from '$lib/paraglide/messages.js';
	import ErrorAlert from './ErrorAlert.svelte';
	import SocialLoginButtons from './SocialLoginButtons.svelte';
	import LoginForm from './LoginForm.svelte';

	export let form: { message?: string } | null = null;
	export let data: { error?: string; message?: string } = {};

	let isLogin = true;
	let socialError: string | undefined = undefined;

	$: combinedMessage = form?.message || data?.error || data?.message || socialError;
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50 p-4">
	<div class="w-full max-w-md">
		<div class="rounded-xl bg-white p-8 shadow-lg">
			<!-- Header -->
			<div class="mb-8 text-center">
				<h1 class="mb-2 text-3xl font-bold text-gray-900">
					{isLogin ? m.login_title_login() : m.login_title_register()}
				</h1>
				<p class="text-gray-600">
					{isLogin ? m.login_sub_login() : m.login_sub_register()}
				</p>
			</div>

			<ErrorAlert message={combinedMessage} />

			<SocialLoginButtons {isLogin} on:error={(e) => (socialError = e.detail)} />

			<!-- Divider -->
			<div class="relative mb-6">
				<div class="absolute inset-0 flex items-center">
					<div class="w-full border-t border-gray-300"></div>
				</div>
				<div class="relative flex justify-center text-sm">
					<span class="bg-white px-2 text-gray-500">{m.or()}</span>
				</div>
			</div>

			<LoginForm {isLogin} on:toggle={() => (isLogin = !isLogin)} />
		</div>
	</div>
</div>


