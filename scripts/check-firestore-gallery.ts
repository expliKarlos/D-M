
import { config } from 'dotenv';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

config({ path: '.env.local' });

const serviceAccountBase64 = process.env.SERVICE_ACCOUNT_BASE64;
if (!serviceAccountBase64) {
    console.error('❌ Missing SERVICE_ACCOUNT_BASE64');
    process.exit(1);
}

const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf8'));

if (getApps().length === 0) {
    initializeApp({
        credential: cert(serviceAccount)
    });
}

const db = getFirestore();

async function countPhotos() {
    const snapshot = await db.collection('photos').get();
    console.log(`📸 Found ${snapshot.size} documents in 'photos' collection.`);
    snapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`   - ID: ${doc.id}, URL: ${data.url}, Approved: ${data.approved}`);
    });

    const socialSnap = await db.collection('social_wall').get();
    console.log(`🧱 Found ${socialSnap.size} documents in 'social_wall' collection.`);
    socialSnap.docs.forEach(doc => {
        const data = doc.data();
        console.log(`   - ID: ${doc.id}, Type: ${data.type}, Content: ${data.content}`);
    });
}

countPhotos().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
