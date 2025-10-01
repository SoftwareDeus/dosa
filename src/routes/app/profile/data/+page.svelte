<script lang="ts">
	import type { PageData } from './$types';
	import { m } from '$lib/paraglide/messages.js';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';

	export let data: PageData;

	let name = data.formDefaults?.name ?? '';
	let phone = data.formDefaults?.phone ?? '';
	let avatarUrl = data.formDefaults?.avatarUrl ?? '';

	const google = data.google;
	const user = data.accountUser;
	const ts = data.me?.ts;

	function back(): void {
		goto(resolve('/app/profile'));
	}
</script>

<div class="min-h-full bg-gray-50">
	<div class="p-6">
		<div class="mb-4 flex items-center justify-between">
			<h1 class="text-2xl font-semibold">{m.data_page_title()}</h1>
			<div class="flex gap-2">
				<a href={resolve('/app/profile/data')} class="rounded bg-gray-100 px-3 py-2 text-sm"
					>{m.data_refresh()}</a
				>
				<button class="rounded border bg-white px-3 py-2 text-sm" on:click={back}
					>{m.data_back()}</button
				>
			</div>
		</div>

		<div class="mb-2 text-xs text-gray-500">{m.data_last_refreshed({ ts: ts ?? '' })}</div>

		<div class="grid gap-4 md:grid-cols-2">
			<section class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
				<h2 class="mb-2 text-lg font-semibold">{m.data_section_account()}</h2>
				<div class="space-y-2 text-sm">
					<div><span class="text-gray-500">ID:</span> {user?.id}</div>
					<div><span class="text-gray-500">Email:</span> {user?.email}</div>
					<div><span class="text-gray-500">Joined:</span> {user?.created_at}</div>
					<div><span class="text-gray-500">Last sign-in:</span> {user?.last_sign_in_at}</div>
					<div>
						<span class="text-gray-500">Provider(s):</span>
						{(data.providers ?? []).join(', ')}
					</div>
				</div>
			</section>

			<section class="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
				<h2 class="mb-2 text-lg font-semibold">{m.data_section_google()}</h2>
				{#if google}
					<div class="space-y-2 text-sm">
						<div><span class="text-gray-500">Name:</span> {google?.names?.[0]?.displayName}</div>
						<div>
							<span class="text-gray-500">Email:</span>
							{google?.emailAddresses?.[0]?.value}
						</div>
						<div><span class="text-gray-500">Phone:</span> {google?.phoneNumbers?.[0]?.value}</div>
						<div><span class="text-gray-500">Gender:</span> {google?.genders?.[0]?.value}</div>
						<div>
							<span class="text-gray-500">Birthday:</span>
							{google?.birthdays?.[0]?.text ||
								google?.birthdays?.[0]?.date?.year +
									'-' +
									google?.birthdays?.[0]?.date?.month +
									'-' +
									google?.birthdays?.[0]?.date?.day}
						</div>
						<div><span class="text-gray-500">Locale:</span> {google?.locales?.[0]?.value}</div>
						<div>
							<span class="text-gray-500">Organization:</span>
							{google?.organizations?.[0]?.name}
						</div>
						<div class="flex items-center gap-2">
							<span class="text-gray-500">Photo:</span>
							{#if google?.photos?.[0]?.url}
								<img src={google.photos[0].url} alt="avatar" class="h-10 w-10 rounded-full" />
							{/if}
						</div>
					</div>
				{:else}
					<div class="text-sm text-gray-500">{m.data_google_missing()}</div>
				{/if}
			</section>
		</div>

		<form method="post" use:enhance class="mt-6 max-w-lg space-y-3">
			<div>
				<label for="name" class="mb-1 block text-sm text-gray-700">{m.field_name()}</label>
				<input id="name" name="name" class="w-full rounded border px-2 py-1" bind:value={name} />
			</div>
			<div>
				<label for="phone" class="mb-1 block text-sm text-gray-700">{m.field_phone()}</label>
				<input id="phone" name="phone" class="w-full rounded border px-2 py-1" bind:value={phone} />
			</div>
			<div>
				<label for="avatar" class="mb-1 block text-sm text-gray-700">{m.field_avatar_url()}</label>
				<input
					id="avatar"
					name="avatarUrl"
					class="w-full rounded border px-2 py-1"
					bind:value={avatarUrl}
				/>
			</div>
			<div class="flex gap-2">
				<button class="rounded bg-blue-600 px-3 py-2 text-sm text-white" type="submit"
					>{m.profile_save()}</button
				>
				<button class="rounded bg-gray-200 px-3 py-2 text-sm" type="button" on:click={back}
					>{m.profile_cancel()}</button
				>
			</div>
		</form>
	</div>
</div>
