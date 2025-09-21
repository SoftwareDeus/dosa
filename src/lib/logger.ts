// src/lib/logger.ts
// Logger utility that can be easily migrated to Sentry later

export enum LogLevel {
	DEBUG = 'debug',
	INFO = 'info',
	WARN = 'warn',
	ERROR = 'error'
}

export interface LogContext {
	[key: string]: unknown;
}

class Logger {
	private isDevelopment =
		typeof window !== 'undefined'
			? window.location.hostname === 'localhost'
			: process.env.NODE_ENV === 'development';

	log(level: LogLevel, message: string, context?: LogContext) {
		const timestamp = new Date().toISOString();
		const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;

		if (this.isDevelopment) {
			// In development, use console
			switch (level) {
				case LogLevel.DEBUG:
					// eslint-disable-next-line no-console
					console.debug(logMessage, context || '');
					break;
				case LogLevel.INFO:
					// eslint-disable-next-line no-console
					console.info(logMessage, context || '');
					break;
				case LogLevel.WARN:
					// eslint-disable-next-line no-console
					console.warn(logMessage, context || '');
					break;
				case LogLevel.ERROR:
					// eslint-disable-next-line no-console
					console.error(logMessage, context || '');
					break;
			}
		} else {
			// In production, send to Sentry (TODO: implement Sentry integration)
			// Sentry.captureMessage(message, level, { extra: context });
			// For now, just log to console in production too
		}
	}

	debug(message: string, context?: LogContext) {
		this.log(LogLevel.DEBUG, message, context);
	}

	info(message: string, context?: LogContext) {
		this.log(LogLevel.INFO, message, context);
	}

	warn(message: string, context?: LogContext) {
		this.log(LogLevel.WARN, message, context);
	}

	error(message: string, context?: LogContext) {
		this.log(LogLevel.ERROR, message, context);
	}

	// Auth-specific logging
	auth(message: string, context?: LogContext) {
		this.info(`[AUTH] ${message}`, context);
	}

	// Navigation-specific logging
	navigation(message: string, context?: LogContext) {
		this.info(`[NAV] ${message}`, context);
	}

	// API-specific logging
	api(message: string, context?: LogContext) {
		this.info(`[API] ${message}`, context);
	}
}

// Export singleton instance
export const logger = new Logger();

// Export individual methods for convenience
export const { debug, info, warn, error, auth, navigation, api } = logger;
