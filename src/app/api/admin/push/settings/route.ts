import { createClient } from '@/lib/utils/supabase/server';
import { NextResponse } from 'next/server';

async function checkAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    return adminEmails.includes(user.email || '');
}

export async function GET() {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('key', 'agenda_reminders_enabled')
        .single();

    return NextResponse.json({ enabled: data?.value === true || data?.value === 'true' });
}

export async function POST(request: Request) {
    if (!await checkAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { enabled } = await request.json();
        const supabase = await createClient();

        const { error } = await supabase
            .from('app_settings')
            .upsert({
                key: 'agenda_reminders_enabled',
                value: enabled, // Supabase handles jsonb
                updated_at: new Date().toISOString()
            });

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
