import { createClient } from '@/lib/utils/supabase/server';
import { createAdminClient } from '@/lib/utils/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const supabaseSession = await createClient();

    // 1. Check admin
    const { data: { user } } = await supabaseSession.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    if (!adminEmails.includes(user.email || '')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const { title, body, scheduled_for, url } = await request.json();

        if (!title || !body || !scheduled_for) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const adminSupabase = createAdminClient();
        const { data, error } = await adminSupabase
            .from('scheduled_notifications')
            .insert({
                payload: { title, body, data: { url } },
                scheduled_for,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET() {
    const supabaseSession = await createClient();
    const { data: { user } } = await supabaseSession.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    if (!adminEmails.includes(user.email || '')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const adminSupabase = createAdminClient();
        const { data, error } = await adminSupabase
            .from('scheduled_notifications')
            .select('*')
            .eq('status', 'pending')
            .order('scheduled_for', { ascending: true });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const supabaseSession = await createClient();
    const { data: { user } } = await supabaseSession.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    if (!adminEmails.includes(user.email || '')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        const adminSupabase = createAdminClient();
        const { error } = await adminSupabase
            .from('scheduled_notifications')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
