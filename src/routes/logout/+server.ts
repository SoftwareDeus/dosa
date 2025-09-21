import type { RequestHandler } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals, cookies, url }) => {
  try {
    console.log('Logout route called - starting logout process');
    
    // Sign out from Supabase
    const { error } = await locals.supabase.auth.signOut();
    
    if (error) {
      console.error('Supabase logout error:', error);
    } else {
      console.log('Supabase logout successful');
    }
    
    // Clear all auth-related cookies
    const cookieNames = [
      'sb-access-token',
      'sb-refresh-token',
      'sb-provider-token',
      'sb-provider-refresh-token',
      'sb-mammexsdwfylvjsvxmnk-auth-token',
      'sb-mammexsdwfylvjsvxmnk-auth-token.0',
      'sb-mammexsdwfylvjsvxmnk-auth-token.1'
    ];
    
    cookieNames.forEach(name => {
      cookies.delete(name, { path: '/' });
      cookies.delete(name, { path: '/', domain: '.supabase.co' });
    });
    
    // Clear all cookies that start with 'sb-'
    const allCookies = cookies.getAll();
    allCookies.forEach(cookie => {
      if (cookie.name.startsWith('sb-')) {
        cookies.delete(cookie.name, { path: '/' });
      }
    });
    
    console.log('All cookies cleared');
    
    // Redirect to login page
    console.log('Redirecting to login page');
    throw redirect(303, '/login');
    
  } catch (error) {
    console.error('Logout error:', error);
    // Still redirect to login even if there's an error
    throw redirect(303, '/login');
  }
};

// Also handle POST requests
export const POST: RequestHandler = async (event) => {
  return GET(event);
};
