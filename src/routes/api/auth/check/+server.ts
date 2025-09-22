import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals, cookies }) => {
	try {
		// Debug: Check what cookies we actually receive
		const allCookies = cookies.getAll();
		console.log('🍪 Received cookies:', allCookies.map(c => ({ name: c.name, hasValue: !!c.value })));
		
		// This forces the server to check the current session from cookies
		const { data: { session } } = await locals.supabase.auth.getSession();
		const { data: { user } } = await locals.supabase.auth.getUser();
		
		console.log('🔍 Auth check API:', {
			hasSession: !!session,
			hasUser: !!user,
			userEmail: user?.email,
			sessionId: session?.session_id
		});
		
		if (user && session) {
			// Update locals to ensure consistency
			locals.session = session;
			locals.user = user;
			
			return json({ 
				authenticated: true, 
				user: { 
					id: user.id, 
					email: user.email 
				} 
			});
		}
		
		return json({ authenticated: false }, { status: 401 });
		
	} catch (error) {
		console.error('Auth check error:', error);
		return json({ 
			authenticated: false, 
			error: error instanceof Error ? error.message : 'Unknown error' 
		}, { status: 500 });
	}
};
