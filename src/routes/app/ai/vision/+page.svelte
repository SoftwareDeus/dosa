<script lang="ts">
	import { analyzeImage } from '$lib/ai/chat-client';
	import { Camera } from '@capacitor/camera';
	import { CameraResultType, CameraSource } from '@capacitor/camera';

	let selectedImage = $state<string | null>(null);
	let prompt = $state('Was siehst du auf diesem Bild?');
	let response = $state<string | null>(null);
	let isLoading = $state(false);
	let error = $state<string | null>(null);

	async function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		// Convert to base64
		const reader = new FileReader();
		reader.onload = (e) => {
			selectedImage = e.target?.result as string;
			response = null;
			error = null;
		};
		reader.readAsDataURL(file);
	}

	async function capturePhoto() {
		try {
			const image = await Camera.getPhoto({
				quality: 90,
				allowEditing: false,
				resultType: CameraResultType.Base64,
				source: CameraSource.Camera
			});

			if (image.base64String) {
				selectedImage = `data:image/${image.format};base64,${image.base64String}`;
				response = null;
				error = null;
			}
		} catch (err: any) {
			error = err.message || 'Fehler beim Aufnehmen des Fotos';
		}
	}

	async function handleAnalyze() {
		if (!selectedImage || !prompt.trim()) return;

		isLoading = true;
		error = null;
		response = null;

		try {
			const result = await analyzeImage(selectedImage, prompt.trim());
			response = result;
		} catch (err: any) {
			error = err.message || 'Fehler bei der Bildanalyse';
		} finally {
			isLoading = false;
		}
	}

	function reset() {
		selectedImage = null;
		response = null;
		error = null;
		prompt = 'Was siehst du auf diesem Bild?';
	}
</script>

<div class="min-h-screen bg-gray-50 p-4">
	<div class="mx-auto max-w-4xl space-y-6">
		<!-- Header -->
		<div class="rounded-xl bg-white p-6 shadow-sm">
			<div class="flex items-center gap-3">
				<div class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
					<span class="text-2xl">👁️</span>
				</div>
				<div>
					<h1 class="text-2xl font-bold text-gray-900">Bild-Analyse</h1>
					<p class="text-sm text-gray-500">Lade ein Bild hoch und lass es von Claude analysieren</p>
				</div>
			</div>
		</div>

		<!-- Upload Section -->
		{#if !selectedImage}
			<div class="rounded-xl bg-white p-6 shadow-sm">
				<div class="space-y-4">
					<div
						class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-12 transition-colors hover:border-blue-500"
					>
						<svg
							class="mb-4 h-16 w-16 text-gray-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
						<p class="mb-2 text-sm text-gray-500">Wähle eine Datei oder mache ein Foto</p>
						<label
							class="mb-2 cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
						>
							Datei hochladen
							<input
								type="file"
								accept="image/*"
								onchange={handleFileUpload}
								class="hidden"
							/>
						</label>
						<button
							onclick={capturePhoto}
							class="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
						>
							📷 Foto aufnehmen
						</button>
					</div>
				</div>
			</div>
		{:else}
			<!-- Image Preview & Analysis -->
			<div class="space-y-4">
				<!-- Image -->
				<div class="rounded-xl bg-white p-6 shadow-sm">
					<div class="mb-4 flex items-center justify-between">
						<h2 class="text-lg font-semibold text-gray-900">Ausgewähltes Bild</h2>
						<button
							onclick={reset}
							class="text-sm text-red-600 hover:text-red-700"
						>
							Zurücksetzen
						</button>
					</div>
					<img
						src={selectedImage}
						alt="Selected"
						class="w-full rounded-lg shadow-md"
					/>
				</div>

				<!-- Prompt -->
				<div class="rounded-xl bg-white p-6 shadow-sm">
					<label for="prompt" class="mb-2 block text-sm font-medium text-gray-700">
						Was möchtest du über das Bild wissen?
					</label>
					<textarea
						id="prompt"
						bind:value={prompt}
						rows="3"
						class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
					></textarea>
					<button
						onclick={handleAnalyze}
						disabled={isLoading || !prompt.trim()}
						class="mt-4 w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-300"
					>
						{#if isLoading}
							<span class="flex items-center justify-center gap-2">
								<span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
								Analysiere...
							</span>
						{:else}
							Bild analysieren
						{/if}
					</button>
				</div>

				<!-- Response -->
				{#if response}
					<div class="rounded-xl bg-white p-6 shadow-sm">
						<h2 class="mb-4 text-lg font-semibold text-gray-900">Analyse-Ergebnis</h2>
						<div class="prose prose-sm max-w-none">
							<p class="whitespace-pre-wrap text-gray-700">{response}</p>
						</div>
					</div>
				{/if}

				<!-- Error -->
				{#if error}
					<div class="rounded-xl bg-red-50 p-4">
						<p class="text-sm text-red-800">
							<strong>Fehler:</strong>
							{error}
						</p>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

