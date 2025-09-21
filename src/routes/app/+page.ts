import type { PageLoad } from './$types';
import { goto } from '$app/navigation';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const load: PageLoad = async ({ url }: { url: URL }) => {
  const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const next = encodeURIComponent(url.pathname + url.search);
    goto(`/login?next=${next}`);
  }
  return {};
};
