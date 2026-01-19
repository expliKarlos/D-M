import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Singleton Supabase client for client-side usage.
 * Uses createBrowserClient to ensure auth state (like PKCE verifiers) works with cookies/SSR.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
