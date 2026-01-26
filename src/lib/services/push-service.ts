import webpush from 'web-push';

let isInitialized = false;

function ensureInitialized() {
    if (isInitialized) return;

    const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
    const SUBJECT = process.env.VAPID_SUBJECT || 'mailto:jncrls@gmail.com';

    if (!PUBLIC_KEY || !PRIVATE_KEY) {
        console.warn('VAPID keys are missing. Push notifications will not work.');
        return;
    }

    try {
        webpush.setVapidDetails(SUBJECT, PUBLIC_KEY, PRIVATE_KEY);
        isInitialized = true;
    } catch (error) {
        console.error('Error setting VAPID details:', error);
    }
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
    ensureInitialized();

    if (!isInitialized) {
        console.error('VAPID keys not configured or invalid');
        return { success: false, error: 'Push service not initialized' };
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
