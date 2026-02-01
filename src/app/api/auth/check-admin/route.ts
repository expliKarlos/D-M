import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

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

        if (!user) {
            return NextResponse.json({ isAdmin: false });
        }

        const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
        const isAdmin = adminEmails.includes(user.email || '');

        return NextResponse.json({ isAdmin });
    } catch (error) {
        console.error('Error checking admin status:', error);
        return NextResponse.json({ isAdmin: false });
    }
}
