import prettier from 'eslint-config-prettier';
import { fileURLToPath } from 'node:url';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';
import sonarjs from 'eslint-plugin-sonarjs';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		plugins: { sonarjs, '@typescript-eslint': ts.plugin },
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		},
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			'no-undef': 'off',

			// General JavaScript/TypeScript rules
			'no-console': 'warn',
			'no-debugger': 'error',
			'no-alert': 'error',
			'no-var': 'error',
			'prefer-const': 'error',
			'prefer-arrow-callback': 'error',
			'arrow-spacing': 'error',
			'no-duplicate-imports': 'error',
			'no-unused-vars': 'off', // Use TypeScript version instead
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_'
				}
			],
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/no-non-null-assertion': 'warn',
			'@typescript-eslint/consistent-type-imports': 'error',
			// Forbid untyped object types
			'no-restricted-syntax': [
				'error',
				{
					selector: 'TSObjectKeyword',
					message: 'Avoid `object` type. Use Record<string, unknown> or a specific type.'
				},
				{
					selector: 'TSTypeLiteral[members.length=0]',
					message: 'Avoid `{}` type. Use Record<string, unknown> or a specific interface.'
				},
				{
					selector: 'TSUnknownKeyword',
					message: 'Avoid `unknown` in types. Prefer a specific type, Json, or never.'
				},
				{
					selector: 'TSUndefinedKeyword',
					message:
						'Do not use `undefined` in types. Prefer optional properties (?), null, or an explicit Optional<T>.'
				}
			],
			'@typescript-eslint/explicit-module-boundary-types': 'error',
			'@typescript-eslint/explicit-function-return-type': [
				'error',
				{
					allowExpressions: true,
					allowTypedFunctionExpressions: true,
					allowHigherOrderFunctions: true
				}
			],
			'@typescript-eslint/no-import-type-side-effects': 'error',

			// Disallow magic numbers in TS files; allow common cases to reduce noise
			'@typescript-eslint/no-magic-numbers': [
				'warn',
				{
					ignore: [0, 1, -1, 3, 4, 10, 90, 100, 400, 401, 429, 500, 1024, 2048],
					ignoreArrayIndexes: true,
					ignoreDefaultValues: true,
					ignoreEnums: true,
					ignoreNumericLiteralTypes: true,
					enforceConst: true,
					detectObjects: true
				}
			],
			// Encourage extracting repeated strings into constants
			'sonarjs/no-duplicate-string': ['warn', { threshold: 5 }]
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		}
	}
);
