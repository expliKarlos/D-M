import { checkIsAdmin } from '@/lib/utils/admin-check';
import { createAdminClient } from '@/lib/utils/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET() {
    if (!await checkIsAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('admin_whitelist')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!await checkIsAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { email } = await request.json();
        if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

        const supabase = createAdminClient();
        const { error } = await supabase
            .from('admin_whitelist')
            .insert({ email: email.toLowerCase().trim() });

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    if (!await checkIsAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

        const supabase = createAdminClient();
        const { error } = await supabase
            .from('admin_whitelist')
            .delete()
            .eq('email', email);

        if (error) {
            // Check for the trigger-raised exception
            if (error.message.includes('permanente')) {
                return NextResponse.json({ error: error.message }, { status: 403 });
            }
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
