import { deLocalizeUrl } from '$lib/paraglide/runtime';

// Narrowed type to match SvelteKit's expected shape without relying on a possibly missing Reroute type
export const reroute = (request: { url: URL }): string => deLocalizeUrl(request.url).pathname;

// Provide an empty transport map to satisfy SvelteKit's generated import expectations
export const transport = {} as Record<string, { decode: (value: unknown) => unknown }>;
