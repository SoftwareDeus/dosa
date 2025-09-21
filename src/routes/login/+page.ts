import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
  // Just return empty data, let component handle auth
  return {};
};
