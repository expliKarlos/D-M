/**
 * Script to list timeline events from Firestore
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (getApps().length === 0) {
    const serviceAccountBase64 = process.env.SERVICE_ACCOUNT_BASE64;
    if (!serviceAccountBase64) {
        throw new Error('SERVICE_ACCOUNT_BASE64 environment variable is required');
    }

    const serviceAccount = JSON.parse(
        Buffer.from(serviceAccountBase64, 'base64').toString('utf-8')
    );

    initializeApp({
        credential: cert(serviceAccount),
    });
}

const db = getFirestore();

async function listEvents() {
    try {
        const eventsRef = db.collection('timeline_events');
        const snapshot = await eventsRef.orderBy('order', 'asc').get();

        console.log(`\n📅 Timeline Events (${snapshot.size} total):\n`);

        snapshot.forEach((doc, index) => {
            const data = doc.data();
            console.log(`${index + 1}. [${data.country}] ${data.title}`);
            console.log(`   📍 ${data.location}`);
            console.log(`   📅 ${data.date} at ${data.time}`);
            console.log(`   🖼️  ${data.image}`);
            console.log(`   ID: ${doc.id}\n`);
        });

    } catch (error) {
        console.error('❌ Error listing events:', error);
        throw error;
    }
}

listEvents()
    .then(() => {
        console.log('✨ Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Failed:', error);
        process.exit(1);
    });
