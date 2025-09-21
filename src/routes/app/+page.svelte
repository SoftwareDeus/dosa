<script lang="ts">
import type { PageLoad } from './$types';
import { goto } from '$app/navigation';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const load: PageLoad = async ({ url }: { url: URL }) => {
  const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    const next = encodeURIComponent(url.pathname + url.search);
    goto(`/login?next=${next}`);
  }
  return {};
};
</script>
<section class="p-4">
  <h1 class="text-xl font-semibold">Welcome 👋</h1>
  <p class="text-sm text-gray-600">Angemeldet als </p>
</section>
