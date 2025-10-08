/**
 * Client-side AI utilities for interacting with the AI API
 */

export interface ChatMessage {
	role: 'user' | 'assistant';
	content: string;
	timestamp?: Date;
}

export interface ChatOptions {
	stream?: boolean;
	model?: string;
	max_tokens?: number;
	system?: string;
	temperature?: number;
}

/**
 * Send a chat message to Claude
 */
export async function sendChatMessage(
	messages: ChatMessage[],
	options: ChatOptions = {}
): Promise<Response> {
	const response = await fetch('/api/ai/chat', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			messages: messages.map((m) => ({ role: m.role, content: m.content })),
			...options
		})
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to send message');
	}

	return response;
}

/**
 * Send a streaming chat message to Claude
 */
export async function* streamChatMessage(
	messages: ChatMessage[],
	options: ChatOptions = {}
): AsyncGenerator<string> {
	const response = await sendChatMessage(messages, { ...options, stream: true });

	const reader = response.body?.getReader();
	if (!reader) throw new Error('Stream not available');

	const decoder = new TextDecoder();
	let buffer = '';

	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			buffer += decoder.decode(value, { stream: true });
			const lines = buffer.split('\n\n');
			buffer = lines.pop() || '';

			const DATA_PREFIX = 'data: ';
			for (const line of lines) {
				if (line.startsWith(DATA_PREFIX)) {
					const data = line.slice(DATA_PREFIX.length);
					if (data === '[DONE]') return;

					try {
						const parsed = JSON.parse(data);
						if (parsed.text) {
							yield parsed.text;
						}
					} catch (_e) {
						// Swallow parse errors to avoid noisy logs in client; surface as stream break
					}
				}
			}
		}
	} finally {
		reader.releaseLock();
	}
}

/**
 * Analyze an image with Claude Vision
 */
export async function analyzeImage(
	image: string,
	prompt: string,
	imageType?: string
): Promise<string> {
	const response = await fetch('/api/ai/vision', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			image,
			prompt,
			imageType
		})
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to analyze image');
	}

	const data = await response.json();
	return data.response;
}

/**
 * Summarize text with Claude
 */
export async function summarizeText(
	text: string,
	length: 'short' | 'medium' | 'long' = 'medium',
	style: 'bullet_points' | 'paragraph' = 'paragraph'
): Promise<string> {
	const response = await fetch('/api/ai/summarize', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			text,
			length,
			style
		})
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to summarize text');
	}

	const data = await response.json();
	return data.summary;
}

/**
 * Translate text with Claude
 */
export async function translateText(
	text: string,
	targetLanguage: string,
	sourceLanguage?: string,
	tone: 'formal' | 'casual' | 'neutral' = 'neutral'
): Promise<string> {
	const response = await fetch('/api/ai/translate', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			text,
			targetLanguage,
			sourceLanguage,
			tone
		})
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to translate text');
	}

	const data = await response.json();
	return data.translation;
}
