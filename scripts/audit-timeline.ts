
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (getApps().length === 0) {
    const serviceAccountBase64 = process.env.SERVICE_ACCOUNT_BASE64;
    if (serviceAccountBase64) {
        const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf-8'));
        initializeApp({ credential: cert(serviceAccount) });
    }
}

const db = getFirestore();

async function auditTimeline() {
    console.log('--- FIRESTORE AUDIT START ---');
    const snapshot = await db.collection('timeline_events').get();

    if (snapshot.empty) {
        console.log('No documents found in timeline_events');
        return;
    }

    snapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`ID: ${doc.id}`);
        console.log(`Title: ${data.title}`);
        console.log(`Date String: ${data.date}`);
        console.log(`Time String: ${data.time}`);
        console.log(`fullDate Type: ${typeof data.fullDate}`);
        console.log(`fullDate Value:`, data.fullDate);
        if (data.fullDate && data.fullDate.toDate) {
            console.log(`fullDate as JS Date:`, data.fullDate.toDate());
        }
        console.log('---');
    });
}

auditTimeline().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
