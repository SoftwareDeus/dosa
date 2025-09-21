import { goto } from '$app/navigation';
import { supabase } from '$lib/supabase/client';
import { browser } from '$app/environment';

// Track redirects to prevent loops
let isRedirecting = false;

export async function requireAuth(redirectTo = '/login') {
  if (!browser) return false;
  
  // Prevent multiple redirects
  if (isRedirecting) {
    console.log('Already redirecting, skipping...');
    return false;
  }
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No user found, redirecting to login');
      isRedirecting = true;
      
      // Use goto for SvelteKit navigation
      goto(redirectTo);
      
      // Reset flag after a delay
      setTimeout(() => {
        isRedirecting = false;
      }, 1000);
      
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Auth check error:', error);
    isRedirecting = true;
    goto(redirectTo);
    
    setTimeout(() => {
      isRedirecting = false;
    }, 1000);
    
    return false;
  }
}

export async function redirectIfAuthenticated(redirectTo = '/app') {
  if (!browser) return false;
  
  // Prevent multiple redirects
  if (isRedirecting) {
    console.log('Already redirecting, skipping...');
    return false;
  }
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      console.log('User found, redirecting to app');
      isRedirecting = true;
      goto(redirectTo);
      
      setTimeout(() => {
        isRedirecting = false;
      }, 1000);
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
}

// Reset redirect flag (call this after successful auth)
export function resetRedirectFlag() {
  isRedirecting = false;
}
