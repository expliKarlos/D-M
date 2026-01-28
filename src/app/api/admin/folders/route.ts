import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/services/firebase-admin'; // Using admin SDK for cleaner writes if available, or client if not. Let's check imports.
// Actually, for Admin API routes, using Firebase Admin SDK is preferred. 
// However, the project seems to mix clients. Let's stick to consistency.
// The user asked for "Folders" management. In the app context, these are "Moments".
// We need to manage the 'moments' collection in Firestore (since the frontend reads from there).

import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Ensure Firebase Admin is initialized (borrow logic from check-gallery or similar)
const serviceAccountBase64 = process.env.SERVICE_ACCOUNT_BASE64;
if (serviceAccountBase64 && getApps().length === 0) {
    const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf8'));
    initializeApp({ credential: cert(serviceAccount) });
}

const firestore = getFirestore();
const MOMENTS_COLLECTION = 'moments';

export async function POST(req: NextRequest) {
    try {
        const { name } = await req.json();
        if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

        const docRef = await firestore.collection(MOMENTS_COLLECTION).add({
            name,
            icon: '📁', // Default icon
            order: 99,   // Default order
            visible: true
        });

        return NextResponse.json({ id: docRef.id, name });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { id, name, visible } = await req.json();
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (visible !== undefined) updateData.visible = visible;

        await firestore.collection(MOMENTS_COLLECTION).doc(id).update(updateData);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update folder' }, { status: 500 });
    }
}
