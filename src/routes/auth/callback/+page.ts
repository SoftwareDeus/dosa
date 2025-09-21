import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, parent }) => {
  const { supabase } = await parent();
  
  const code = url.searchParams.get('code');
  const next = url.searchParams.get('next') || '/app';
  
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('Auth callback error:', error);
      throw redirect(303, `/login?error=auth_failed&message=${encodeURIComponent(error.message)}`);
    }
  }
  
  // Check if user is authenticated (use getUser for security)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw redirect(303, '/login');
  }
  
  throw redirect(303, next);
};
