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
    initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

async function checkGallery() {
    console.log('🔍 Checking social_wall collection...\n');

    const snapshot = await db.collection('social_wall')
        .where('type', '==', 'photo')
        .orderBy('timestamp', 'desc')
        .limit(20)
        .get();

    console.log(`📊 Found ${snapshot.size} photo documents\n`);

    if (snapshot.empty) {
        console.log('⚠️  No photos found in Firestore!');
        console.log('   The seed script may have failed silently.');
        return;
    }

    snapshot.docs.forEach((doc, i) => {
        const data = doc.data();
        console.log(`${i + 1}. ${data.author} - ${new Date(data.timestamp).toLocaleString()}`);
        console.log(`   URL: ${data.content.substring(0, 80)}...`);
        console.log(`   Approved: ${data.approved}\n`);
    });
}

checkGallery()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('💥 Error:', error);
        process.exit(1);
    });
