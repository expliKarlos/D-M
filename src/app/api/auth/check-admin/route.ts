import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set() { },
                    remove() { },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return NextResponse.json({ isAdmin: false });
        }

        // 1. Check environment variable (primary admins)
        const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
        let isAdmin = adminEmails.includes(user.email);

        // 2. If not in env var, check database whitelist
        if (!isAdmin) {
            try {
                const supabaseAdmin = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY!,
                    { auth: { persistSession: false } }
                );

                const { data } = await supabaseAdmin
                    .from('admin_whitelist')
                    .select('email')
                    .eq('email', user.email.toLowerCase())
                    .maybeSingle();

                isAdmin = !!data;
            } catch (error) {
                console.error('Error checking admin whitelist:', error);
            }
        }

        return NextResponse.json({ isAdmin });
    } catch (error) {
        console.error('Error checking admin status:', error);
        return NextResponse.json({ isAdmin: false });
    }
}
