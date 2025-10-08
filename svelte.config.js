import vercel from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: vercel(),
		csrf: {
			checkOrigin: process.env.NODE_ENV === 'production'
		},
		prerender: {
			handleHttpError: 'warn'
		}
	}
};

export default config;
