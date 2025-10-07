import type { RequestHandler } from '@sveltejs/kit';
import { requireUserAPI } from '$lib/server/auth';
import { anthropic, DEFAULT_MODEL, isAIEnabled } from '$lib/server/ai';
import { HttpStatus } from '$lib/types/http';

export const prerender = false;

/**
 * POST /api/ai/vision
 * Claude Vision endpoint for image analysis
 * 
 * Request body:
 * - image: string (base64 encoded image or URL)
 * - prompt: string (what to analyze in the image)
 * - imageType?: string (image/jpeg, image/png, image/gif, image/webp)
 * - model?: string (default: claude-3-5-sonnet)
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
		const { image, prompt, imageType = 'image/jpeg', model = DEFAULT_MODEL, max_tokens = 2048 } = body;

		// Validate inputs
		if (!image || !prompt) {
			return Response.json(
				{ error: 'Both image and prompt are required' },
				{ status: HttpStatus.BAD_REQUEST }
			);
		}

		// Prepare the image source
		let imageSource: any;
		if (image.startsWith('http://') || image.startsWith('https://')) {
			// URL-based image
			imageSource = {
				type: 'url',
				url: image
			};
		} else {
			// Base64 image (remove data URI prefix if present)
			const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
			imageSource = {
				type: 'base64',
				media_type: imageType,
				data: base64Data
			};
		}

		// Call Claude with vision
		const message = await anthropic.messages.create({
			model,
			max_tokens,
			messages: [
				{
					role: 'user',
					content: [
						{
							type: 'image',
							source: imageSource
						},
						{
							type: 'text',
							text: prompt
						}
					]
				}
			]
		});

		// Extract text response
		const textContent = message.content.find((block) => block.type === 'text');
		const responseText = textContent && 'text' in textContent ? textContent.text : '';

		return Response.json({
			response: responseText,
			id: message.id,
			model: message.model,
			usage: message.usage
		});
	} catch (error: any) {
		console.error('Claude Vision API error:', error);

		if (error.status === 429) {
			return Response.json(
				{ error: 'Rate limit exceeded. Please try again later.' },
				{ status: HttpStatus.TOO_MANY_REQUESTS }
			);
		}

		return Response.json(
			{ error: error.message || 'Failed to analyze image' },
			{ status: HttpStatus.INTERNAL_SERVER_ERROR }
		);
	}
};

