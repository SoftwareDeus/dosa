import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'com.dosa.app',
	appName: 'dosa',
	webDir: 'build',
	server: {
		androidScheme: 'https'
	}
};

export default config;
