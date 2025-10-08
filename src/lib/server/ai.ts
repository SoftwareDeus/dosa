import Anthropic from '@anthropic-ai/sdk';
import { env } from '$env/dynamic/private';
import { logger } from '$lib/logger';

/**
 * Get API key from environment with fallback to process.env
 */
function getApiKey(): string {
	// Try $env/dynamic/private first
	let key = env.ANTHROPIC_API_KEY ?? null;

	// Fallback to process.env (works in Node.js environment)
	if (!key && typeof process !== 'undefined' && process.env) {
		const envKey = process.env.ANTHROPIC_API_KEY;
		if (typeof envKey === 'string' && envKey) key = envKey;
	}

	return key ?? '';
}

const apiKey = getApiKey();

// Debug: Log API key status (only first/last 4 chars for security)
if (apiKey) {
	const PREFIX_LEN = 10;
	const SUFFIX_LEN = 4;
	const masked = `${apiKey.slice(0, PREFIX_LEN)}...${apiKey.slice(apiKey.length - SUFFIX_LEN)}`;
	logger.info('✅ ANTHROPIC_API_KEY loaded', { masked });
} else {
	logger.error('❌ ANTHROPIC_API_KEY not found in environment variables');
	logger.error('   Checked: $env/dynamic/private and process.env');
	logger.info('   Available $env keys', { keys: Object.keys(env) });
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
	OPUS_4: 'claude-opus-4-0'
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
		logger.warn('🔍 isAIEnabled() check: No API key found');
	}
	return !!key;
}
