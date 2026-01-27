import { createClient } from '@/lib/utils/supabase/server';
import { adminDb } from '@/lib/services/firebase-admin';
import { broadcastPush } from '@/lib/services/push-broadcast';
import { NextResponse } from 'next/server';

/**
 * CRON API: Scheduled to run every 15-30 minutes.
 * Checks for upcoming events in the next 30 minutes and sends reminders.
 */
export async function GET(request: Request) {
    // 1. Security Check (Vercel Cron Secret)
    const authHeader = request.headers.get('authorization');
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    try {
        // 2. Check global toggle
        const { data: setting } = await supabase
            .from('app_settings')
            .select('*')
            .eq('key', 'agenda_reminders_enabled')
            .single();

        if (!setting || (setting.value !== true && setting.value !== 'true')) {
            return NextResponse.json({ status: 'Automation disabled' });
        }

        const now = new Date();

        // 3. Process Scheduled Notifications
        const { data: scheduled, error: schedError } = await supabase
            .from('scheduled_notifications')
            .select('*')
            .eq('status', 'pending')
            .lte('scheduled_for', now.toISOString());

        if (!schedError && scheduled && scheduled.length > 0) {
            for (const item of scheduled) {
                try {
                    await broadcastPush(
                        item.payload.title,
                        item.payload.body,
                        'manual',
                        item.payload.data?.url
                    );
                    await supabase
                        .from('scheduled_notifications')
                        .update({ status: 'sent', sent_at: new Date().toISOString() })
                        .eq('id', item.id);
                } catch (e) {
                    console.error(`Error sending scheduled notification ${item.id}:`, e);
                    await supabase
                        .from('scheduled_notifications')
                        .update({ status: 'failed' })
                        .eq('id', item.id);
                }
            }
        }

        // 4. Fetch upcoming events from Firestore (using Admin SDK)
        const db = adminDb();
        if (!db) throw new Error('Firestore Admin not initialized');

        // Look for events starting in the next 45 minutes (to cover execution jitter)
        const future45 = new Date(now.getTime() + 45 * 60 * 1000);

        const snapshot = await db.collection('timeline_events')
            .where('fullDate', '>=', now)
            .where('fullDate', '<=', future45)
            .get();

        if (snapshot.empty && (!scheduled || scheduled.length === 0)) {
            return NextResponse.json({ status: 'No work to do' });
        }

        // 5. Avoid double notifications for agenda
        const { data: notifiedSetting } = await supabase
            .from('app_settings')
            .select('*')
            .eq('key', 'last_notified_event_ids')
            .single();

        const notifiedIds = Array.isArray(notifiedSetting?.value) ? notifiedSetting.value : [];
        const eventsToNotify = snapshot.docs.filter(doc => !notifiedIds.includes(doc.id));

        // 6. Broadcast agenda reminders
        for (const doc of eventsToNotify) {
            const data = doc.data();
            await broadcastPush(
                `🔔 ¡Evento próximo!`,
                `"${data.title}" comenzará pronto (${data.time}). ¡No te lo pierdas!`,
                'automation',
                '/planning/agenda' // Deep link to agenda
            );
        }

        // 7. Update notification history state
        const newNotifiedIds = [...notifiedIds, ...eventsToNotify.map(d => d.id)].slice(-50);
        await supabase.from('app_settings').upsert({
            key: 'last_notified_event_ids',
            value: newNotifiedIds,
            updated_at: new Date().toISOString()
        });

        return NextResponse.json({
            status: 'Success',
            scheduled_sent: scheduled?.length || 0,
            agenda_notified: eventsToNotify.length
        });

    } catch (error: any) {
        console.error('Cron Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
