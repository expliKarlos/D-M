import { createClient } from './supabase/server';
import { createAdminClient } from './supabase/admin';

/**
 * Checks if the current authenticated user is an authorized administrator.
 * Checks both ADMIN_EMAILS environment variable AND admin_whitelist table.
 */
export async function checkIsAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) return false;

    // 1. Check environment variable (primary admins)
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    if (adminEmails.includes(user.email)) return true;

    // 2. Check database whitelist (UI-managed admins)
    try {
        const adminClient = createAdminClient();
        const { data, error } = await adminClient
            .from('admin_whitelist')
            .select('email')
            .eq('email', user.email.toLowerCase())
            .maybeSingle();

        if (error || !data) return false;
        return true;
    } catch {
        return false;
    }
}
