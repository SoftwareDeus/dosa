import type { RequestHandler } from '@sveltejs/kit';
import { requireUserAPI } from '$lib/server/auth';

export const prerender = false;

export const GET: RequestHandler = async (event) => {
	const userOr401 = await requireUserAPI(event);
	if (userOr401 instanceof Response) return userOr401;
	const user = userOr401;
	return Response.json({ id: user.id, email: user.email });
};
