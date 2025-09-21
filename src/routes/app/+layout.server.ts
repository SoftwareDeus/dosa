import type { LayoutServerLoad } from './$types';
import { requireUserPage } from '$lib/server/auth';

export const load: LayoutServerLoad = async (event) => {
  const user = await requireUserPage(event);
  return { user: { id: user.id, email: user.email } };
};
