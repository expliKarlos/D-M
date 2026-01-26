import { createClient } from '@/lib/utils/supabase/server';
import { NextResponse } from 'next/server';
import { sendPushNotification } from '@/lib/services/push-service';

export async function POST(request: Request) {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Find all subscriptions for this user
        const { data: subscriptions, error: subError } = await supabase
            .from('push_subscriptions')
            .select('*')
            .eq('user_id', user.id);

        if (subError) throw subError;

        if (!subscriptions || subscriptions.length === 0) {
            return NextResponse.json({ error: 'No subscriptions found' }, { status: 404 });
        }

        const results = await Promise.all(subscriptions.map(async (sub) => {
            const pushData = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                }
            };

            return await sendPushNotification(pushData, {
                title: '¡Prueba de Notificación! 🎉',
                body: 'Este es un aviso de prueba de la boda de María & Digvijay.',
                data: {
                    url: `/${request.headers.get('accept-language')?.split(',')[0] || 'es'}/enlace`,
                    vibration: [200, 100, 200]
                }
            });
        }));

        return NextResponse.json({ success: true, results });

    } catch (error: any) {
        console.error('Test push error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
