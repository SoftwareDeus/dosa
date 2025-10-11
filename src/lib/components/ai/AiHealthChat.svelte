<script lang="ts">
    import { streamChatMessage, type ChatMessage } from '$lib/ai/chat-client';
    import { onMount } from 'svelte';
    import { m } from '$lib/paraglide/messages.js';

    interface HealthData {
        age?: number;
        height?: number;
        weight?: number;
        bloodType?: string;
        allergies?: string;
        medications?: string;
        conditions?: string;
    }

    interface Props {
        data: any;
    }

    let { data }: Props = $props();

    let messages = $state<ChatMessage[]>([]);
    let inputMessage = $state('');
    let isLoading = $state(false);
    let error = $state<string | null>(null);
    let chatContainer: HTMLDivElement;
    let extractedData = $state<HealthData | null>(null);
    let isExtracting = $state(false);
    let isSaving = $state(false);
    let saveSuccess = $state(false);
    let isProcessing = $state(false);

    // LocalStorage helpers
    const STORAGE_KEY = `health_chat_messages_${data.user.id}`;
    
    function saveMessagesToStorage(msgs: ChatMessage[]): void {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
        } catch (e) {
            console.error('Failed to save messages to localStorage:', e);
        }
    }

    function loadMessagesFromStorage(): ChatMessage[] | null {
        if (typeof window === 'undefined') return null;
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) return null;
            const parsed = JSON.parse(stored);
            // Convert timestamp strings back to Date objects
            return parsed.map((m: any) => ({
                ...m,
                timestamp: m.timestamp ? new Date(m.timestamp) : undefined
            }));
        } catch (e) {
            console.error('Failed to load messages from localStorage:', e);
            return null;
        }
    }

    function clearMessagesFromStorage(): void {
        if (typeof window === 'undefined') return;
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.error('Failed to clear messages from localStorage:', e);
        }
    }

    function buildSystemPrompt(): string {
        const existingData = data.healthProfile;
        let prompt = `Du bist ein freundlicher und einfühlsamer KI-Assistent, der dem Benutzer hilft, sein Gesundheitsprofil zu erstellen oder zu aktualisieren.

Der Benutzer heißt ${data.user.name}.`;

        if (existingData && Object.keys(existingData).length > 0) {
            prompt += `\n\nDer Benutzer hat bereits folgende Gesundheitsdaten:`;
            if (existingData.age) prompt += `\n- Alter: ${existingData.age}`;
            if (existingData.height) prompt += `\n- Größe: ${existingData.height} cm`;
            if (existingData.weight) prompt += `\n- Gewicht: ${existingData.weight} kg`;
            if (existingData.bloodType) prompt += `\n- Blutgruppe: ${existingData.bloodType}`;
            if (existingData.allergies) prompt += `\n- Allergien: ${existingData.allergies}`;
            if (existingData.medications) prompt += `\n- Medikamente: ${existingData.medications}`;
            if (existingData.conditions) prompt += `\n- Vorerkrankungen: ${existingData.conditions}`;
            
            prompt += `\n\nFrage den Benutzer, ob er diese Daten aktualisieren möchte oder fehlende Informationen ergänzen will.`;
        } else {
            prompt += `\n\nStelle nacheinander Fragen zu folgenden Gesundheitsdaten:`;
        }

        prompt += `
- Alter
- Größe (in cm)
- Gewicht (in kg)
- Blutgruppe
- Allergien (falls vorhanden)
- Aktuelle Medikamente (falls vorhanden)
- Vorerkrankungen oder chronische Erkrankungen (falls vorhanden)

Sei dabei:
- Freundlich und empathisch
- Natürlich im Gesprächsstil
- Ermutigend, wenn der Benutzer zögert
- Geduldig bei unvollständigen Antworten
- Respektvoll bei sensiblen Themen

WICHTIG: Frage nach MEHREREN Informationen gleichzeitig, um den Prozess effizient zu gestalten. 
Zum Beispiel: "Kannst du mir bitte dein Alter, deine Größe und dein Gewicht nennen?"
Oder: "Hast du Allergien, nimmst du aktuell Medikamente oder hast du chronische Erkrankungen?"

Gruppiere zusammengehörige oder einfache Fragen zusammen. Stelle maximal 2-3 Fragen pro Nachricht.

SEHR WICHTIG: Wenn du alle relevanten Gesundheitsdaten gesammelt hast (Alter, Größe, Gewicht, und optional Blutgruppe, Allergien, Medikamente, Vorerkrankungen), beende deine Nachricht IMMER mit diesem exakten Signal:

[DATEN_VOLLSTÄNDIG]

Dies MUSS am Ende deiner letzten Nachricht stehen, wenn die Datenerfassung abgeschlossen ist.`;

        return prompt;
    }

    const SYSTEM_PROMPT = buildSystemPrompt();

    onMount(() => {
        // Initialize extracted data with existing profile if available
        if (data.healthProfile && Object.keys(data.healthProfile).length > 0) {
            extractedData = { ...data.healthProfile };
        }

        // Try to load messages from localStorage first
        const storedMessages = loadMessagesFromStorage();
        if (storedMessages && storedMessages.length > 0) {
            messages = storedMessages;
            return;
        }

        // Personalize welcome message
        let welcomeMessage = `Hallo ${data.user.name}! 👋\n\n`;
        
        if (data.healthProfile && Object.keys(data.healthProfile).length > 0) {
            welcomeMessage += `Ich sehe, du hast bereits einige Gesundheitsdaten in deinem Profil. Möchtest du diese aktualisieren oder ergänzen? Sag mir einfach, was du ändern möchtest, oder ich kann dir deine aktuellen Daten zeigen.`;
        } else {
            welcomeMessage += `Ich helfe dir dabei, dein Gesundheitsprofil zu erstellen. Lass uns mit den grundlegenden Informationen starten:\n\nKannst du mir bitte dein Alter, deine Größe (in cm) und dein Gewicht (in kg) nennen?`;
        }

        messages = [
            {
                role: 'assistant',
                content: welcomeMessage,
                timestamp: new Date()
            }
        ];
        saveMessagesToStorage(messages);
    });

    $effect(() => {
        if (chatContainer) {
            setTimeout(() => {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }, 100);
        }
    });

    async function handleSend(): Promise<void> {
        if (!inputMessage.trim() || isLoading) return;

        error = null;
        saveSuccess = false;
        const userMessage = inputMessage.trim();
        inputMessage = '';

        messages = [
            ...messages,
            {
                role: 'user',
                content: userMessage,
                timestamp: new Date()
            }
        ];
        saveMessagesToStorage(messages);

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
            // Create messages array with system prompt
            const messagesForAI: ChatMessage[] = [
                { role: 'user', content: SYSTEM_PROMPT },
                ...messages.slice(0, assistantMessageIndex)
            ];

            let fullResponse = '';
            for await (const chunk of streamChatMessage(messagesForAI, { system: SYSTEM_PROMPT })) {
                fullResponse += chunk;
                messages = messages.map((msg, idx) =>
                    idx === assistantMessageIndex ? { ...msg, content: fullResponse } : msg
                );
            }
            
            // Save updated messages after streaming is complete
            saveMessagesToStorage(messages);
            
            // Check if AI signaled data completion
            if (fullResponse.includes('[DATEN_VOLLSTÄNDIG]')) {
                // Wait a moment for UI to update, then auto-extract and save
                setTimeout(() => {
                    autoExtractAndSave();
                }, 1000);
            }
        } catch (err: any) {
            error = err.message || 'Ein Fehler ist aufgetreten';
            messages = messages.slice(0, -1);
            saveMessagesToStorage(messages);
        } finally {
            isLoading = false;
        }
    }

    function handleKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    }

    function formatTime(date?: Date): string {
        if (!date) return '';
        return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    }

    async function autoExtractAndSave(): Promise<void> {
        if (isProcessing) return;

        isProcessing = true;
        isExtracting = true;
        error = null;
        saveSuccess = false;

        try {
            // Step 1: Extract data
            console.log('🔍 Auto-extracting health data from chat...');
            const extractResponse = await fetch('/api/ai/extract-health', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: messages.map(m => ({ role: m.role, content: m.content.replace('[DATEN_VOLLSTÄNDIG]', '') }))
                })
            });

            if (!extractResponse.ok) {
                const errorData = await extractResponse.json();
                console.error('❌ Extract error:', errorData);
                throw new Error(errorData.error || m.health_error_extract());
            }

            const extractResult = await extractResponse.json();
            console.log('✅ Extracted data:', extractResult.data);
            extractedData = extractResult.data;
            isExtracting = false;

            // Step 2: Auto-save data immediately without user interaction
            isSaving = true;
            
            // Merge with existing data - new data takes precedence
            const dataToSave = {
                ...data.healthProfile,
                ...extractedData
            };

            console.log('💾 Auto-saving to profile:', dataToSave);
            const saveResponse = await fetch('/api/profile/health', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSave)
            });

            if (!saveResponse.ok) {
                const errorData = await saveResponse.json();
                console.error('❌ Save error:', errorData);
                throw new Error(errorData.error || m.health_error_save());
            }

            const saveResult = await saveResponse.json();
            console.log('✅ Data saved successfully!', saveResult);
            saveSuccess = true;
            
            // Update local data reference
            data.healthProfile = dataToSave;
            
            // Clear chat history from localStorage after successful save
            clearMessagesFromStorage();
            
            // Navigate to profile after 2 seconds
            setTimeout(() => {
                window.location.href = '/app/profile';
            }, 2000);

        } catch (err: any) {
            console.error('💥 Error in autoExtractAndSave:', err);
            error = err.message || (isExtracting ? m.health_error_extract() : m.health_error_save());
        } finally {
            isProcessing = false;
            isExtracting = false;
            isSaving = false;
        }
    }
</script>

<div class="flex h-full flex-col bg-gray-50">
    <div class="border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <span class="text-xl">🏥</span>
            </div>
            <div>
                <h1 class="text-lg font-semibold text-gray-900">{m.health_title()}</h1>
                <p class="text-sm text-gray-500">{isLoading ? 'Tippt...' : 'Online'}</p>
            </div>
        </div>
    </div>

    <div bind:this={chatContainer} class="flex-1 space-y-4 overflow-y-auto p-4">
        {#if (data.healthProfile && Object.keys(data.healthProfile).length > 0) && !saveSuccess}
            <div class="mx-auto max-w-2xl rounded-lg bg-blue-50 p-4 shadow-sm">
                <h3 class="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-900">
                    <span>ℹ️</span>
                    <span>Deine aktuellen Gesundheitsdaten</span>
                </h3>
                <div class="space-y-2 text-sm">
                    {#if data.healthProfile.age}
                        <div class="flex justify-between">
                            <span class="text-blue-700">{m.health_field_age()}:</span>
                            <span class="font-medium text-blue-900">{data.healthProfile.age}</span>
                        </div>
                    {/if}
                    {#if data.healthProfile.height}
                        <div class="flex justify-between">
                            <span class="text-blue-700">{m.health_field_height()}:</span>
                            <span class="font-medium text-blue-900">{data.healthProfile.height} cm</span>
                        </div>
                    {/if}
                    {#if data.healthProfile.weight}
                        <div class="flex justify-between">
                            <span class="text-blue-700">{m.health_field_weight()}:</span>
                            <span class="font-medium text-blue-900">{data.healthProfile.weight} kg</span>
                        </div>
                    {/if}
                    {#if data.healthProfile.bloodType}
                        <div class="flex justify-between">
                            <span class="text-blue-700">{m.health_field_blood_type()}:</span>
                            <span class="font-medium text-blue-900">{data.healthProfile.bloodType}</span>
                        </div>
                    {/if}
                    {#if data.healthProfile.allergies}
                        <div>
                            <span class="text-blue-700">{m.health_field_allergies()}:</span>
                            <p class="mt-1 font-medium text-blue-900">{data.healthProfile.allergies}</p>
                        </div>
                    {/if}
                    {#if data.healthProfile.medications}
                        <div>
                            <span class="text-blue-700">{m.health_field_medications()}:</span>
                            <p class="mt-1 font-medium text-blue-900">{data.healthProfile.medications}</p>
                        </div>
                    {/if}
                    {#if data.healthProfile.conditions}
                        <div>
                            <span class="text-blue-700">{m.health_field_conditions()}:</span>
                            <p class="mt-1 font-medium text-blue-900">{data.healthProfile.conditions}</p>
                        </div>
                    {/if}
                </div>
            </div>
        {/if}

        {#each messages as message, i (i)}
            <div class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}">
                <div class="max-w-[80%] rounded-2xl px-4 py-3 {message.role === 'user' ? 'bg-green-600 text-white' : 'bg-white text-gray-900 shadow-sm'}">
                    <p class="text-sm leading-relaxed break-words whitespace-pre-wrap">
                        {(message.content || (isLoading && i === messages.length - 1 ? '...' : '')).replace('[DATEN_VOLLSTÄNDIG]', '')}
                    </p>
                    {#if message.timestamp}
                        <p class="mt-1 text-xs {message.role === 'user' ? 'text-green-200' : 'text-gray-400'}">{formatTime(message.timestamp)}</p>
                    {/if}
                </div>
            </div>
        {/each}

        {#if isProcessing}
            <div class="mx-auto max-w-md rounded-lg bg-blue-50 p-4">
                <div class="flex items-center gap-3">
                    <div class="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                    <p class="text-sm text-blue-800">
                        {isExtracting ? 'Extrahiere Daten...' : isSaving ? 'Speichere in Profil...' : m.health_extraction_started()}
                    </p>
                </div>
            </div>
        {/if}

        {#if error}
            <div class="mx-auto max-w-md rounded-lg bg-red-50 p-4">
                <p class="text-sm text-red-800"><strong>Fehler:</strong> {error}</p>
                <button 
                    onclick={autoExtractAndSave}
                    class="mt-3 rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                >
                    Erneut versuchen
                </button>
            </div>
        {/if}

        {#if saveSuccess}
            <div class="mx-auto max-w-md rounded-lg bg-green-50 p-4">
                <p class="text-sm text-green-800"><strong>✓</strong> Daten erfolgreich gespeichert!</p>
                <p class="mt-2 text-xs text-green-700">Weiterleitung zum Profil...</p>
            </div>
        {/if}

        {#if messages.length > 3 && !isProcessing && !saveSuccess}
            <div class="mx-auto max-w-2xl">
                <button
                    onclick={autoExtractAndSave}
                    class="w-full rounded-lg bg-green-600 py-3 text-white transition-colors hover:bg-green-700"
                >
                    ✅ Daten jetzt speichern
                </button>
            </div>
        {/if}

    </div>

    <div class="border-t border-gray-200 bg-white p-4">
        <form onsubmit={handleSend} class="flex gap-2">
            <textarea
                bind:value={inputMessage}
                onkeydown={handleKeyDown}
                placeholder={m.health_chat_placeholder()}
                disabled={isLoading}
                rows="1"
                class="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
            ></textarea>
            <button
                type="button"
                onclick={handleSend}
                disabled={isLoading || !inputMessage.trim()}
                class="flex h-12 w-12 items-center justify-center rounded-xl bg-green-600 text-white transition-colors hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500"
            >
                {#if isLoading}
                    <span class="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                {:else}
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                {/if}
            </button>
        </form>
        <p class="mt-2 text-center text-xs text-gray-500">Claude kann Fehler machen. Überprüfe wichtige Informationen.</p>
    </div>
</div>

<style>
    :global(html, body) {
        height: 100%;
        margin: 0;
        overflow: hidden;
    }
</style>

