import Anthropic from '@anthropic-ai/sdk';
import { env } from '$env/dynamic/private';

/**
 * Get API key from environment with fallback to process.env
 */
function getApiKey(): string {
	// Try $env/dynamic/private first
	let key = env.ANTHROPIC_API_KEY;
	
	// Fallback to process.env (works in Node.js environment)
	if (!key && typeof process !== 'undefined' && process.env) {
		key = process.env.ANTHROPIC_API_KEY;
	}
	
	return key || '';
}

const apiKey = getApiKey();

// Debug: Log API key status (only first/last 4 chars for security)
if (apiKey) {
	console.log('✅ ANTHROPIC_API_KEY loaded:', apiKey.slice(0, 10) + '...' + apiKey.slice(-4));
} else {
	console.error('❌ ANTHROPIC_API_KEY not found in environment variables');
	console.error('   Checked: $env/dynamic/private and process.env');
	console.log('   Available $env keys:', Object.keys(env).join(', '));
}

/**
 * Anthropic client for Claude AI
 * Initialized with API key from environment variables
 */
export const anthropic = new Anthropic({
	apiKey: apiKey
});

/**
 * Available Claude models
 * Using confirmed working model names from Anthropic API
 */
export const CLAUDE_MODELS = {
    SONNET_4: 'claude-sonnet-4-0',
    OPUS_4: 'claude-opus-4-0',
} as const;

/**
 * Default model for most AI operations (hardcoded)
 */
export const DEFAULT_MODEL = CLAUDE_MODELS.SONNET_4;

/**
 * Check if AI features are enabled
 */
export function isAIEnabled(): boolean {
	const key = getApiKey();
	if (!key) {
		console.log('🔍 isAIEnabled() check: No API key found');
	}
	return !!key;
}

