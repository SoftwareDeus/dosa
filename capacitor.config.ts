import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'com.useit.app',
	appName: 'useit',
	webDir: 'build',
	server: {
		androidScheme: 'https'
	}
};

export default config;
