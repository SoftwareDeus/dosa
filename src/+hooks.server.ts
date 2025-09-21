import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Handle } from '@sveltejs/kit';
import type { HandleServerError } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => event.cookies.getAll().map((c) => ({ name: c.name, value: c.value })),
      setAll: (cookies) => {
        for (const { name, value, options } of cookies) {
          event.cookies.set(name, value, { ...options, path: '/', httpOnly: true, secure: true, sameSite: 'lax' });
        }
      }
    },
    cookieOptions: { name: 'sb' as const },
    cookieEncoding: 'base64url'
  });

  const { data } = await supabase.auth.getSession();
  event.locals.user = data.session?.user ?? null;
event.locals.user = data.session?.user ?? null;
event.locals.session = data.session ?? null;

  return resolve(event);
};

export const handleError: HandleServerError = ({ error, event }) => {
  console.error('[Route error]', event.route?.id, '\n', error); // ← echter Stack im Terminal
  return { message: 'Internal Error' }; // Browser bekommt generische Meldung
};
