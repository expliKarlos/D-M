import { createClient } from './supabase/server';

/**
 * Checks if the current authenticated user is an authorized administrator.
 * Verified by checking the email against the ADMIN_EMAILS environment variable.
 */
export async function checkIsAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return false;

    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    return adminEmails.includes(user.email || '');
}
