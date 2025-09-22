import { deLocalizeUrl } from '$lib/paraglide/runtime';

// Narrowed type to match SvelteKit's expected shape without relying on a possibly missing Reroute type
export const reroute = (request: { url: URL }): string => deLocalizeUrl(request.url).pathname;
