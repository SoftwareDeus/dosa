<script lang="ts">
	import { summarizeText, translateText } from '$lib/ai/chat-client';

	let activeTab = $state<'summarize' | 'translate'>('summarize');

	// Summarize state
	let summarizeInput = $state('');
	let summarizeLength = $state<'short' | 'medium' | 'long'>('medium');
	let summarizeStyle = $state<'bullet_points' | 'paragraph'>('paragraph');
	let summarizeResult = $state<string | null>(null);
	let summarizeLoading = $state(false);
	let summarizeError = $state<string | null>(null);

	// Translate state
	let translateInput = $state('');
	let targetLanguage = $state('English');
	let sourceLanguage = $state('');
	let translateTone = $state<'formal' | 'casual' | 'neutral'>('neutral');
	let translateResult = $state<string | null>(null);
	let translateLoading = $state(false);
	let translateError = $state<string | null>(null);

	async function handleSummarize() {
		if (!summarizeInput.trim()) return;

		summarizeLoading = true;
		summarizeError = null;
		summarizeResult = null;

		try {
			const result = await summarizeText(
				summarizeInput.trim(),
				summarizeLength,
				summarizeStyle
			);
			summarizeResult = result;
		} catch (err: any) {
			summarizeError = err.message || 'Fehler bei der Zusammenfassung';
		} finally {
			summarizeLoading = false;
		}
	}

	async function handleTranslate() {
		if (!translateInput.trim() || !targetLanguage.trim()) return;

		translateLoading = true;
		translateError = null;
		translateResult = null;

		try {
			const result = await translateText(
				translateInput.trim(),
				targetLanguage.trim(),
				sourceLanguage.trim() || undefined,
				translateTone
			);
			translateResult = result;
		} catch (err: any) {
			translateError = err.message || 'Fehler bei der Übersetzung';
		} finally {
			translateLoading = false;
		}
	}

	const languages = [
		'English',
		'German',
		'Spanish',
		'French',
		'Italian',
		'Portuguese',
		'Dutch',
		'Russian',
		'Chinese',
		'Japanese',
		'Korean'
	];
</script>

<div class="min-h-screen bg-gray-50 p-4">
	<div class="mx-auto max-w-4xl space-y-6">
		<!-- Header -->
		<div class="rounded-xl bg-white p-6 shadow-sm">
			<div class="flex items-center gap-3">
				<div class="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
					<span class="text-2xl">🛠️</span>
				</div>
				<div>
					<h1 class="text-2xl font-bold text-gray-900">KI-Tools</h1>
					<p class="text-sm text-gray-500">Zusammenfassen, übersetzen und mehr</p>
				</div>
			</div>
		</div>

		<!-- Tabs -->
		<div class="rounded-xl bg-white shadow-sm">
			<div class="border-b border-gray-200">
				<div class="flex">
					<button
						onclick={() => (activeTab = 'summarize')}
						class="flex-1 border-b-2 px-6 py-4 text-sm font-medium transition-colors {activeTab ===
						'summarize'
							? 'border-green-600 text-green-600'
							: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
					>
						📝 Zusammenfassen
					</button>
					<button
						onclick={() => (activeTab = 'translate')}
						class="flex-1 border-b-2 px-6 py-4 text-sm font-medium transition-colors {activeTab ===
						'translate'
							? 'border-green-600 text-green-600'
							: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
					>
						🌍 Übersetzen
					</button>
				</div>
			</div>

			<div class="p-6">
				{#if activeTab === 'summarize'}
					<!-- Summarize Tab -->
					<div class="space-y-4">
						<div>
							<label for="summarize-input" class="mb-2 block text-sm font-medium text-gray-700">
								Text zum Zusammenfassen
							</label>
							<textarea
								id="summarize-input"
								bind:value={summarizeInput}
								rows="8"
								placeholder="Füge hier den Text ein, den du zusammenfassen möchtest..."
								class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
							></textarea>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div>
								<label for="length" class="mb-2 block text-sm font-medium text-gray-700">
									Länge
								</label>
								<select
									id="length"
									bind:value={summarizeLength}
									class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
								>
									<option value="short">Kurz (2-3 Sätze)</option>
									<option value="medium">Mittel (1-2 Absätze)</option>
									<option value="long">Lang (Mehrere Absätze)</option>
								</select>
							</div>

							<div>
								<label for="style" class="mb-2 block text-sm font-medium text-gray-700">
									Stil
								</label>
								<select
									id="style"
									bind:value={summarizeStyle}
									class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
								>
									<option value="paragraph">Fließtext</option>
									<option value="bullet_points">Stichpunkte</option>
								</select>
							</div>
						</div>

						<button
							onclick={handleSummarize}
							disabled={summarizeLoading || !summarizeInput.trim()}
							class="w-full rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition-colors hover:bg-green-700 disabled:bg-gray-300"
						>
							{#if summarizeLoading}
								<span class="flex items-center justify-center gap-2">
									<span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
									Fasse zusammen...
								</span>
							{:else}
								Zusammenfassen
							{/if}
						</button>

						{#if summarizeResult}
							<div class="rounded-lg bg-green-50 p-4">
								<h3 class="mb-2 font-medium text-green-900">Zusammenfassung:</h3>
								<p class="whitespace-pre-wrap text-sm text-green-800">{summarizeResult}</p>
							</div>
						{/if}

						{#if summarizeError}
							<div class="rounded-lg bg-red-50 p-4">
								<p class="text-sm text-red-800">
									<strong>Fehler:</strong>
									{summarizeError}
								</p>
							</div>
						{/if}
					</div>
				{:else}
					<!-- Translate Tab -->
					<div class="space-y-4">
						<div>
							<label for="translate-input" class="mb-2 block text-sm font-medium text-gray-700">
								Text zum Übersetzen
							</label>
							<textarea
								id="translate-input"
								bind:value={translateInput}
								rows="6"
								placeholder="Füge hier den Text ein, den du übersetzen möchtest..."
								class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
							></textarea>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div>
								<label for="source-lang" class="mb-2 block text-sm font-medium text-gray-700">
									Ausgangssprache (optional)
								</label>
								<input
									id="source-lang"
									type="text"
									bind:value={sourceLanguage}
									placeholder="Automatisch erkennen"
									class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
								/>
							</div>

							<div>
								<label for="target-lang" class="mb-2 block text-sm font-medium text-gray-700">
									Zielsprache
								</label>
								<select
									id="target-lang"
									bind:value={targetLanguage}
									class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
								>
									{#each languages as lang}
										<option value={lang}>{lang}</option>
									{/each}
								</select>
							</div>
						</div>

						<div>
							<label for="tone" class="mb-2 block text-sm font-medium text-gray-700">
								Ton
							</label>
							<select
								id="tone"
								bind:value={translateTone}
								class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
							>
								<option value="neutral">Neutral</option>
								<option value="formal">Formal</option>
								<option value="casual">Locker</option>
							</select>
						</div>

						<button
							onclick={handleTranslate}
							disabled={translateLoading || !translateInput.trim() || !targetLanguage.trim()}
							class="w-full rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition-colors hover:bg-green-700 disabled:bg-gray-300"
						>
							{#if translateLoading}
								<span class="flex items-center justify-center gap-2">
									<span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
									Übersetze...
								</span>
							{:else}
								Übersetzen
							{/if}
						</button>

						{#if translateResult}
							<div class="rounded-lg bg-green-50 p-4">
								<h3 class="mb-2 font-medium text-green-900">Übersetzung:</h3>
								<p class="whitespace-pre-wrap text-sm text-green-800">{translateResult}</p>
							</div>
						{/if}

						{#if translateError}
							<div class="rounded-lg bg-red-50 p-4">
								<p class="text-sm text-red-800">
									<strong>Fehler:</strong>
									{translateError}
								</p>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

