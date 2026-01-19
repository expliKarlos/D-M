import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { initializeApp as initializeAdminApp, getApps as getAdminApps, cert } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getStorage as getAdminStorage } from 'firebase-admin/storage';

// --- Client Side Initialization ---

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase for the client
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const storage = getStorage(app);

// --- Server Side Initialization (Admin SDK) ---

/**
 * Initializes the Firebase Admin SDK using a Base64 encoded service account.
 * This should ONLY be used in Server Components, Actions, or Route Handlers.
 */
export function getAdminAppInstance() {
    if (getAdminApps().length > 0) return getAdminApps()[0];

    const serviceAccountBase64 = process.env.SERVICE_ACCOUNT_BASE64;

    if (!serviceAccountBase64) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('SERVICE_ACCOUNT_BASE64 is missing in production environment.');
        }
        // In dev, we might allow it to be missing if only client-side features are used
        return null;
    }

    try {
        const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf8'));
        return initializeAdminApp({
            credential: cert(serviceAccount),
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
    } catch (error) {
        console.error('Error decoding SERVICE_ACCOUNT_BASE64:', error);
        throw error;
    }
}

export const adminAuth = () => {
    const adminApp = getAdminAppInstance();
    return adminApp ? getAdminAuth(adminApp) : null;
};

export const adminStorage = () => {
    const adminApp = getAdminAppInstance();
    return adminApp ? getAdminStorage(adminApp) : null;
};
