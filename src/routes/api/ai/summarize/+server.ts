import type { RequestHandler } from '@sveltejs/kit';
import { requireUserAPI } from '$lib/server/auth';
import { anthropic, CLAUDE_MODELS, isAIEnabled } from '$lib/server/ai';
import { HttpStatus } from '$lib/types/http';

export const prerender = false;

/**
 * POST /api/ai/summarize
 * Summarize text using Claude
 * 
 * Request body:
 * - text: string (text to summarize)
 * - length?: 'short' | 'medium' | 'long' (default: 'medium')
 * - style?: 'bullet_points' | 'paragraph' (default: 'paragraph')
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
			text,
			length = 'medium',
			style = 'paragraph'
		}: {
			text: string;
			length: 'short' | 'medium' | 'long';
			style: 'bullet_points' | 'paragraph';
		} = body;

		// Validate input
		if (!text || typeof text !== 'string') {
			return Response.json(
				{ error: 'Text is required and must be a string' },
				{ status: HttpStatus.BAD_REQUEST }
			);
		}

		// Build the prompt based on options
		const lengthInstructions = {
			short: 'in 2-3 sentences',
			medium: 'in 1-2 paragraphs',
			long: 'in detail with multiple paragraphs'
		};

		const styleInstructions = {
			bullet_points: 'Format your response as bullet points.',
			paragraph: 'Format your response as flowing paragraphs.'
		};

		const systemPrompt = `You are a helpful assistant that summarizes text clearly and concisely. ${styleInstructions[style]}`;
		const userPrompt = `Please summarize the following text ${lengthInstructions[length]}:\n\n${text}`;

		// Use Haiku for faster summarization (using Claude 3 Haiku)
		const message = await anthropic.messages.create({
			model: 'claude-3-haiku-20240307',
			max_tokens: 1024,
			system: systemPrompt,
			messages: [
				{
					role: 'user',
					content: userPrompt
				}
			]
		});
       // Extract text response
		const textContent = message.content.find((block) => block.type === 'text');
		const summary = textContent && 'text' in textContent ? textContent.text : '';

		return Response.json({
			summary,
			id: message.id,
			model: message.model,
			usage: message.usage
		});
	} catch (error: any) {
		console.error('Claude Summarize API error:', error);

		if (error.status === 429) {
			return Response.json(
				{ error: 'Rate limit exceeded. Please try again later.' },
				{ status: HttpStatus.TOO_MANY_REQUESTS }
			);
		}

		return Response.json(
			{ error: error.message || 'Failed to summarize text' },
			{ status: HttpStatus.INTERNAL_SERVER_ERROR }
		);
	}
};

