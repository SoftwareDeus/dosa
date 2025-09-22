import type { Session, User } from '@supabase/supabase-js';
import type { createServerClient } from '@supabase/ssr';

declare global {
	namespace App {
		interface Locals {
			user: User | null;
			session: Session | null;
			supabase: ReturnType<typeof createServerClient>;
		}
		interface PageData {
			user?: {
				id: string;
				email: string;
			} | null;
		}
	}
}
export {};
