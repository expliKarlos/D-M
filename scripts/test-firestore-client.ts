/**
 * Test script to verify Firestore rules and client access
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log('\n🔧 Testing Firebase Client SDK Access...\n');
console.log('Project ID:', firebaseConfig.projectId);
console.log('API Key:', firebaseConfig.apiKey?.substring(0, 10) + '...\n');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testAccess() {
    try {
        console.log('📋 Attempting to read timeline_events collection...');
        const eventsRef = collection(db, 'timeline_events');
        const q = query(eventsRef, orderBy('order', 'asc'));

        const snapshot = await getDocs(q);

        console.log(`✅ SUCCESS! Retrieved ${snapshot.size} events\n`);

        snapshot.forEach((doc, index) => {
            const data = doc.data();
            console.log(`${index + 1}. ${data.title} (${data.country})`);
        });

    } catch (error: any) {
        console.error('❌ ERROR:', error.code);
        console.error('Message:', error.message);
        console.error('\nFull error:', error);
    }
}

testAccess()
    .then(() => {
        console.log('\n✨ Test complete!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Test failed:', error);
        process.exit(1);
    });
