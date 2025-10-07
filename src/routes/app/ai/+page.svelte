<script lang="ts">
	import { streamChatMessage, type ChatMessage } from '$lib/ai/chat-client';
	import { onMount } from 'svelte';

	let messages = $state<ChatMessage[]>([]);
	let inputMessage = $state('');
	let isLoading = $state(false);
	let error = $state<string | null>(null);
	let chatContainer: HTMLDivElement;

	// Initial greeting
	onMount(() => {
		messages = [
			{
				role: 'assistant',
				content:
					'Hallo! Ich bin Claude, dein KI-Assistent. Wie kann ich dir heute helfen?',
				timestamp: new Date()
			}
		];
	});

	// Auto-scroll to bottom when new messages arrive
	$effect(() => {
		if (chatContainer) {
			setTimeout(() => {
				chatContainer.scrollTop = chatContainer.scrollHeight;
			}, 100);
		}
	});

	async function handleSend() {
		if (!inputMessage.trim() || isLoading) return;

		error = null;
		const userMessage = inputMessage.trim();
		inputMessage = '';

		// Add user message
		messages = [
			...messages,
			{
				role: 'user',
				content: userMessage,
				timestamp: new Date()
			}
		];

		// Add placeholder for assistant message
		const assistantMessageIndex = messages.length;
		messages = [
			...messages,
			{
				role: 'assistant',
				content: '',
				timestamp: new Date()
			}
		];

		isLoading = true;

		try {
			// Stream the response
			let fullResponse = '';
			for await (const chunk of streamChatMessage(messages.slice(0, assistantMessageIndex))) {
				fullResponse += chunk;
				// Update the last message with the accumulated response
				messages = messages.map((msg, idx) =>
					idx === assistantMessageIndex ? { ...msg, content: fullResponse } : msg
				);
			}
		} catch (err: any) {
			error = err.message || 'Ein Fehler ist aufgetreten';
			// Remove the placeholder message if there was an error
			messages = messages.slice(0, -1);
		} finally {
			isLoading = false;
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSend();
		}
	}

	function formatTime(date: Date | undefined) {
		if (!date) return '';
		return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
	}
</script>

<div class="flex h-full flex-col bg-gray-50">
	<!-- Header -->
	<div class="border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
		<div class="flex items-center gap-3">
			<div class="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
				<span class="text-xl">🤖</span>
			</div>
			<div>
				<h1 class="text-lg font-semibold text-gray-900">Claude AI Chat</h1>
				<p class="text-sm text-gray-500">
					{isLoading ? 'Tippt...' : 'Online'}
				</p>
			</div>
		</div>
	</div>

	<!-- Messages -->
	<div bind:this={chatContainer} class="flex-1 space-y-4 overflow-y-auto p-4">
		{#each messages as message, i (i)}
			<div
				class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}"
			>
				<div
					class="max-w-[80%] rounded-2xl px-4 py-3 {message.role === 'user'
						? 'bg-purple-600 text-white'
						: 'bg-white text-gray-900 shadow-sm'}"
				>
					<p class="whitespace-pre-wrap break-words text-sm leading-relaxed">
						{message.content || (isLoading && i === messages.length - 1 ? '...' : '')}
					</p>
					{#if message.timestamp}
						<p
							class="mt-1 text-xs {message.role === 'user'
								? 'text-purple-200'
								: 'text-gray-400'}"
						>
							{formatTime(message.timestamp)}
						</p>
					{/if}
				</div>
			</div>
		{/each}

		{#if error}
			<div class="mx-auto max-w-md rounded-lg bg-red-50 p-4">
				<p class="text-sm text-red-800">
					<strong>Fehler:</strong>
					{error}
				</p>
			</div>
		{/if}
	</div>

	<!-- Input -->
	<div class="border-t border-gray-200 bg-white p-4">
		<form onsubmit={handleSend} class="flex gap-2">
			<textarea
				bind:value={inputMessage}
				onkeydown={handleKeyDown}
				placeholder="Schreibe eine Nachricht..."
				disabled={isLoading}
				rows="1"
				class="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:text-gray-500"
			></textarea>
			<button
				type="button"
				onclick={handleSend}
				disabled={isLoading || !inputMessage.trim()}
				class="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 text-white transition-colors hover:bg-purple-700 disabled:bg-gray-300 disabled:text-gray-500"
			>
				{#if isLoading}
					<span class="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
				{:else}
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
						/>
					</svg>
				{/if}
			</button>
		</form>
		<p class="mt-2 text-center text-xs text-gray-500">
			Claude kann Fehler machen. Überprüfe wichtige Informationen.
		</p>
	</div>
</div>

<style>
	/* Make sure the page fills the viewport */
	:global(html, body) {
		height: 100%;
		margin: 0;
		overflow: hidden;
	}
</style>

