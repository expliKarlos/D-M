import { createClient } from '@/lib/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { subscription, action } = body;

        if (action === 'unsubscribe') {
            const { error: deleteError } = await supabase
                .from('push_subscriptions')
                .delete()
                .eq('endpoint', subscription.endpoint)
                .eq('user_id', user.id);

            if (deleteError) throw deleteError;
            return NextResponse.json({ success: true });
        }

        // Save or update subscription
        const { error: upsertError } = await supabase
            .from('push_subscriptions')
            .upsert({
                user_id: user.id,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'endpoint'
            });

        if (upsertError) throw upsertError;

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Push subscription error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
