import vercel from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import 'dotenv/config';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: vercel(),
		...(process.env.SERVER_URL
			? {
				csrf: {
					trustedOrigins: [process.env.SERVER_URL]
				}
			}
			: {}),
		prerender: {
			handleHttpError: 'warn'
		}
	}
};

export default config;
