import { createClient } from '@/lib/utils/supabase/server';
import { NextResponse } from 'next/server';
import { broadcastPush } from '@/lib/services/push-broadcast';

export async function POST(request: Request) {
    const supabase = await createClient();

    // 1. Check authentication and admin status
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    if (!adminEmails.includes(user.email || '')) {
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { title, body: messageBody } = body;

        if (!title || !messageBody) {
            return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
        }

        const result = await broadcastPush(title, messageBody, 'manual');

        return NextResponse.json({
            success: true,
            recipients: result.count
        });

    } catch (error: any) {
        console.error('Broadcast API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
