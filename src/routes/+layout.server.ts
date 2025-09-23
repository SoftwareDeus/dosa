import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Make user available to all pages
	return {
		user: locals.user
			? {
					id: locals.user.id,
					email: locals.user.email
				}
			: null
	};
};
