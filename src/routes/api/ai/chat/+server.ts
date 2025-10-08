import type { RequestHandler } from '@sveltejs/kit';
import { requireUserAPI } from '$lib/server/auth';
import { anthropic, DEFAULT_MODEL, isAIEnabled } from '$lib/server/ai';
import { HttpStatus } from '$lib/types/http';
import { logger } from '$lib/logger';

export const prerender = false;

/**
 * POST /api/ai/chat
 * Claude chat endpoint with streaming support
 *
 * Request body:
 * - messages: Array of { role: 'user' | 'assistant', content: string }
 * - stream?: boolean (default: false)
 * - model?: string (default: claude-3-5-sonnet)
 * - max_tokens?: number (default: 2048)
 * - system?: string (optional system prompt)
 */
export const POST: RequestHandler = async (event) => {
	// Check authentication
	const userOr401 = await requireUserAPI(event);
	if (userOr401 instanceof Response) return userOr401;

	// Check if AI is enabled
	if (!isAIEnabled()) {
		return Response.json(
			{ error: 'AI features are not enabled. Please configure ANTHROPIC_API_KEY.' },
			{ status: HttpStatus.SERVICE_UNAVAILABLE }
		);
	}

	try {
		const body = await event.request.json();
		const {
			messages = [],
			stream = false,
			model = DEFAULT_MODEL,
			max_tokens = 2048,
			system,
			temperature = 1.0
		} = body;

		// Validate messages
		if (!Array.isArray(messages) || messages.length === 0) {
			return Response.json(
				{ error: 'Messages array is required and must not be empty' },
				{ status: HttpStatus.BAD_REQUEST }
			);
		}

		// Handle streaming response
		if (stream) {
			const streamResponse = await anthropic.messages.stream({
				model,
				max_tokens,
				messages,
				...(system && { system }),
				temperature
			});

			// Create a ReadableStream for Server-Sent Events
			const readableStream = new ReadableStream({
				async start(controller) {
					try {
						for await (const chunk of streamResponse) {
							if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
								const text = chunk.delta.text;
								// Send as Server-Sent Event
								const data = `data: ${JSON.stringify({ text })}\n\n`;
								controller.enqueue(new TextEncoder().encode(data));
							}
						}
						controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
						controller.close();
					} catch (error) {
						logger.error('Streaming error', { error: String(error) });
						controller.error(error);
					}
				}
			});

			return new Response(readableStream, {
				headers: {
					'Content-Type': 'text/event-stream',
					'Cache-Control': 'no-cache',
					Connection: 'keep-alive'
				}
			});
		}

		// Handle non-streaming response
		const message = await anthropic.messages.create({
			model,
			max_tokens,
			messages,
			...(system && { system }),
			temperature
		});

		return Response.json({
			content: message.content,
			id: message.id,
			model: message.model,
			role: message.role,
			stop_reason: message.stop_reason,
			usage: message.usage
		});
	} catch (e) {
		const error = e as { status?: number; message?: string };
		logger.error('Claude API error', {
			status: error.status ?? null,
			message: error.message ?? null
		});

		// Handle rate limiting
		if (error.status === 429) {
			return Response.json(
				{ error: 'Rate limit exceeded. Please try again later.' },
				{ status: HttpStatus.TOO_MANY_REQUESTS }
			);
		}

		// Handle authentication errors
		if (error.status === 401) {
			return Response.json(
				{ error: 'Invalid API key. Please check your ANTHROPIC_API_KEY.' },
				{ status: HttpStatus.INTERNAL_SERVER_ERROR }
			);
		}

		return Response.json(
			{ error: error.message ?? 'Failed to generate response' },
			{ status: HttpStatus.INTERNAL_SERVER_ERROR }
		);
	}
};
