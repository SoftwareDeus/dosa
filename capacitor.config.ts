import type { CapacitorConfig } from '@capacitor/cli';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';

// Load .env file
loadEnv({ path: resolve(process.cwd(), '.env') });

const config: CapacitorConfig = {
	appId: 'com.dosa.app',
	appName: 'dosa',
	webDir: 'build',
	server: {
		androidScheme: 'https',
		// Load from SERVER_URL in .env (should be without trailing slash)
		url: process.env.SERVER_URL || undefined,
		cleartext: true // Allow HTTP for local development
	}
};

export default config;
