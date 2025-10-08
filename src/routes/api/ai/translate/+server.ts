import type { RequestHandler } from '@sveltejs/kit';
import { requireUserAPI } from '$lib/server/auth';
import { anthropic, isAIEnabled } from '$lib/server/ai';
import { HttpStatus } from '$lib/types/http';
import { logger } from '$lib/logger';

export const prerender = false;

/**
 * POST /api/ai/translate
 * Translate text using Claude
 *
 * Request body:
 * - text: string (text to translate)
 * - targetLanguage: string (target language, e.g., 'German', 'Spanish', 'French')
 * - sourceLanguage?: string (optional, will auto-detect if not provided)
 * - tone?: 'formal' | 'casual' (default: 'neutral')
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
			targetLanguage,
			sourceLanguage,
			tone = 'neutral'
		}: {
			text: string;
			targetLanguage: string;
			sourceLanguage?: string;
			tone: 'formal' | 'casual' | 'neutral';
		} = body;

		// Validate input
		if (!text || typeof text !== 'string') {
			return Response.json(
				{ error: 'Text is required and must be a string' },
				{ status: HttpStatus.BAD_REQUEST }
			);
		}

		if (!targetLanguage) {
			return Response.json(
				{ error: 'Target language is required' },
				{ status: HttpStatus.BAD_REQUEST }
			);
		}

		// Build the prompt
		const toneInstructions = {
			formal: 'Use formal language and tone.',
			casual: 'Use casual, conversational language.',
			neutral: 'Use neutral, standard language.'
		};

		const sourceInfo = sourceLanguage ? ` from ${sourceLanguage}` : '';
		const systemPrompt = `You are a professional translator. Translate text accurately while preserving meaning and context. ${toneInstructions[tone]} Only provide the translation, without any explanations or additional text.`;
		const userPrompt = `Translate the following text${sourceInfo} to ${targetLanguage}:\n\n${text}`;

		// Use Haiku for fast translations (using Claude 3 Haiku)
		const MAX_TOKENS = 2048;
		const message = await anthropic.messages.create({
			model: 'claude-3-haiku-20240307',
			max_tokens: MAX_TOKENS,
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
		const translation = textContent && 'text' in textContent ? textContent.text : '';

		return Response.json({
			translation,
			targetLanguage,
			sourceLanguage: sourceLanguage || 'auto-detected',
			id: message.id,
			model: message.model,
			usage: message.usage
		});
	} catch (e) {
		const error = e as { status?: number; message?: string };
		logger.error('Claude Translate API error', {
			status: error.status ?? null,
			message: error.message ?? null
		});

		if (error.status === 429) {
			return Response.json(
				{ error: 'Rate limit exceeded. Please try again later.' },
				{ status: HttpStatus.TOO_MANY_REQUESTS }
			);
		}

		return Response.json(
			{ error: error.message ?? 'Failed to translate text' },
			{ status: HttpStatus.INTERNAL_SERVER_ERROR }
		);
	}
};
