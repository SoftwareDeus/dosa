<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { Capacitor } from '@capacitor/core';
  import { supabase } from '$lib/supabase/client';
  // Note: Apple Sign In will be handled via web OAuth for now
  // Native Apple Sign In can be added later with proper Capacitor plugin setup

  export let form: { message?: string } | undefined;
  export let data: { error?: string; message?: string } = {};
  
  let isLogin = true;
  let isLoading = false;

  function toggleMode() {
    isLogin = !isLogin;
  }

  async function signInWithGoogle() {
    isLoading = true;
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Google login error:', error);
    } finally {
      isLoading = false;
    }
  }

  async function signInWithApple() {
    isLoading = true;
    try {
      // Use web OAuth for Apple Sign In
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Apple login error:', error);
      // Show error message to user
      form = { message: 'Apple Sign In fehlgeschlagen. Bitte versuche es erneut.' };
    } finally {
      isLoading = false;
    }
  }

  let isIOS = false;
  let showAppleSignIn = true;

  onMount(() => {
    // Check if we're on iOS for Apple Sign In
    isIOS = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
    
    // Check if Apple Sign In is available
    if (isIOS) {
      // Apple Sign In is available on iOS
      showAppleSignIn = true;
    } else {
      // Check if we're on a web browser that supports Apple Sign In
      showAppleSignIn = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                       (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome'));
    }
  });
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
  <div class="w-full max-w-md">
    <div class="bg-white rounded-xl shadow-lg p-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {isLogin ? 'Willkommen zurück' : 'Konto erstellen'}
        </h1>
        <p class="text-gray-600">
          {isLogin ? 'Melde dich in deinem Konto an' : 'Erstelle ein neues Konto'}
        </p>
      </div>

      <!-- Error Message -->
      {#if form?.message || data?.error || data?.message}
        <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-600 text-sm">
            {form?.message || data?.error || data?.message}
          </p>
        </div>
      {/if}

      <!-- Social Login Buttons -->
      <div class="space-y-3 mb-6">
        <button
          on:click={signInWithGoogle}
          disabled={isLoading}
          class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Mit Google {isLogin ? 'anmelden' : 'registrieren'}
        </button>

        {#if showAppleSignIn}
          <button
            on:click={signInWithApple}
            disabled={isLoading}
            class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Mit Apple {isLogin ? 'anmelden' : 'registrieren'}
          </button>
        {/if}
      </div>

      <!-- Divider -->
      <div class="relative mb-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white text-gray-500">oder</span>
        </div>
      </div>

      <!-- Email/Password Form -->
      <form method="post" use:enhance>
        <input type="hidden" name="action" value={isLogin ? 'login' : 'register'} />
        
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              E-Mail-Adresse
            </label>
            <input 
              id="email"
              name="email" 
              type="email" 
              required 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="deine@email.com"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              Passwort
            </label>
            <input 
              id="password"
              name="password" 
              type="password" 
              required 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          {#if !isLogin}
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
                Passwort bestätigen
              </label>
              <input 
                id="confirmPassword"
                name="confirmPassword" 
                type="password" 
                required 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
          {/if}
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          class="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isLoading ? 'Wird verarbeitet...' : (isLogin ? 'Anmelden' : 'Registrieren')}
        </button>
      </form>

      <!-- Toggle Mode -->
      <div class="mt-6 text-center">
        <button 
          on:click={toggleMode}
          class="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {isLogin ? 'Noch kein Konto? Jetzt registrieren' : 'Bereits ein Konto? Jetzt anmelden'}
        </button>
      </div>
    </div>
  </div>
</div>
