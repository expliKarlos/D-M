import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Diagnostic endpoint to test admin access detection
 * Call this as an admin user to see if database check works
 */
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

        const diagnostics = {
            timestamp: new Date().toISOString(),
            user: user ? {
                email: user.email,
                id: user.id,
            } : null,
            checks: {
                envVar: {
                    found: false,
                    adminEmails: [] as string[],
                },
                database: {
                    found: false,
                    error: null as any,
                    data: null as any,
                },
            },
            finalDecision: false,
        };

        if (!user || !user.email) {
            return NextResponse.json({
                error: 'No authenticated user',
                diagnostics,
            });
        }

        // 1. Check environment variable
        const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
        diagnostics.checks.envVar.adminEmails = adminEmails;
        diagnostics.checks.envVar.found = adminEmails.includes(user.email);

        // 2. Check database
        if (!diagnostics.checks.envVar.found) {
            try {
                const supabaseAdmin = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY!,
                    { auth: { persistSession: false } }
                );

                const { data, error } = await supabaseAdmin
                    .from('admin_whitelist')
                    .select('email')
                    .eq('email', user.email.toLowerCase())
                    .maybeSingle();

                diagnostics.checks.database.data = data;
                diagnostics.checks.database.error = error ? {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                } : null;
                diagnostics.checks.database.found = !!data;
            } catch (error: any) {
                diagnostics.checks.database.error = {
                    message: error.message,
                    stack: error.stack,
                };
            }
        }

        // Final decision
        diagnostics.finalDecision = diagnostics.checks.envVar.found || diagnostics.checks.database.found;

        return NextResponse.json({
            isAdmin: diagnostics.finalDecision,
            diagnostics,
        });
    } catch (error: any) {
        return NextResponse.json({
            error: 'Exception in diagnostic',
            message: error.message,
            stack: error.stack,
        }, { status: 500 });
    }
}
