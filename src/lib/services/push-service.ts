import webpush from 'web-push';

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@bodadigvijaymaria.com';

if (PUBLIC_KEY && PRIVATE_KEY) {
    webpush.setVapidDetails(
        SUBJECT,
        PUBLIC_KEY,
        PRIVATE_KEY
    );
}

export interface PushMessage {
    title: string;
    body: string;
    icon?: string;
    image?: string;
    data?: {
        url?: string;
        vibration?: number[];
        [key: string]: any;
    };
}

export async function sendPushNotification(subscription: any, message: PushMessage) {
    if (!PUBLIC_KEY || !PRIVATE_KEY) {
        console.error('VAPID keys not configured');
        return;
    }

    try {
        await webpush.sendNotification(
            subscription,
            JSON.stringify(message)
        );
        return { success: true };
    } catch (error: any) {
        console.error('Error sending push notification:', error);

        // If subscription is expired or invalid, we should probably delete it
        if (error.statusCode === 404 || error.statusCode === 410) {
            return { success: false, shouldDelete: true };
        }

        return { success: false, error: error.message };
    }
}
