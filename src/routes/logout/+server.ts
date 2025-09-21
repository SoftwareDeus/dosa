import type { RequestHandler } from '@sveltejs/kit';
export const POST: RequestHandler = async ({ locals, cookies }) => {
  await locals.supabase.auth.signOut();
  cookies.delete('sb-access-token', { path: '/' });
  cookies.delete('sb-refresh-token', { path: '/' });
  return new Response(null, { status: 303, headers: { Location: '/' } });
};
