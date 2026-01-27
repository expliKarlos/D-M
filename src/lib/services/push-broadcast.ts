import { createClient } from '@/lib/utils/supabase/server';
import { sendPushNotification } from './push-service';
import { translateText } from './vertex-ai';

/**
 * Broadcasts a push notification to all subscribed users.
 * Automatically translates content to English and Hindi based on user preferences.
 */
export async function broadcastPush(title: string, body: string, type: 'manual' | 'automation' = 'manual', url?: string) {
    const supabase = await createClient();

    // 1. Get all subscriptions with preferred_lang from profiles
    const { data: subs, error: subsError } = await supabase
        .from('push_subscriptions')
        .select(`
            endpoint,
            p256dh,
            auth,
            user_id,
            profiles:user_id (preferred_lang)
        `) as any;

    if (subsError) {
        console.error('Error fetching subscriptions:', subsError);
        throw subsError;
    }

    if (!subs || subs.length === 0) return { count: 0 };

    // 2. Prepare translations cache
    // We combine title and body with a separator to translate in a single call
    let translations: any = null;
    try {
        translations = await translateText(`${title} | ${body}`);
    } catch (error) {
        console.error('Translation error in broadcast:', error);
        // Fallback to original text if translation fails
    }

    const results = await Promise.all(subs.map(async (sub: any) => {
        // sub.profiles might be an array or object depending on relation
        const profile = Array.isArray(sub.profiles) ? sub.profiles[0] : sub.profiles;
        const lang = profile?.preferred_lang || 'es';

        let finalTitle = title;
        let finalBody = body;

        if (lang !== 'es' && translations) {
            const translatedPart = translations[lang] || translations['en'];
            if (translatedPart && translatedPart.includes('|')) {
                const [tTitle, tBody] = translatedPart.split('|').map((s: string) => s.trim());
                finalTitle = tTitle || title;
                finalBody = tBody || body;
            } else if (translatedPart) {
                // If the separator was lost, we use the whole part as body or title
                finalBody = translatedPart;
            }
        }

        const pushData = {
            endpoint: sub.endpoint,
            keys: {
                p256dh: sub.p256dh,
                auth: sub.auth
            }
        };

        const result = await sendPushNotification(pushData, {
            title: finalTitle,
            body: finalBody,
            data: {
                url: url ? `/${lang}${url}` : `/${lang}/enlace`,
                vibration: [200, 100, 200]
            }
        });

        // 3. Clean up failed subscriptions (404/410)
        if (result.shouldDelete) {
            await supabase
                .from('push_subscriptions')
                .delete()
                .eq('endpoint', sub.endpoint);
        }

        return result.success;
    }));

    const successCount = results.filter(Boolean).length;

    // 4. Record history
    await supabase.from('notification_history').insert({
        title,
        body,
        recipients_count: successCount,
        type
    });

    return { count: successCount };
}
