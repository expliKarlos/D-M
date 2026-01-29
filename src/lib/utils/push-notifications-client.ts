import { urlBase64ToUint8Array } from './vapid';

export async function checkPushSubscription() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        return false;
    }

    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        return !!subscription;
    } catch (err) {
        console.warn('Error checking push subscription:', err);
        return false;
    }
}

export async function requestPushSubscription() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Push notifications not supported');
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
        throw new Error('PERMISSION_DENIED');
    }

    // Wait for the service worker to be ready
    const registration = await navigator.serviceWorker.ready;
    if (!registration) throw new Error('Service Worker not ready');

    const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicVapidKey) {
        console.error('VAPID public key missing from environment variables');
        throw new Error('VAPID_KEY_MISSING');
    }

    try {
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        });

        const res = await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subscription }),
        });

        if (!res.ok) throw new Error('SAVE_FAILED');

        return true;
    } catch (err: any) {
        console.error('Subscription error:', err);
        throw err;
    }
}

export async function unsubscribePush() {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
            await subscription.unsubscribe();
            await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscription, action: 'unsubscribe' }),
            });
        }
    }
    return true;
}
