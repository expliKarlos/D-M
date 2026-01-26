import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import fs from 'fs';

// Load env vars
if (fs.existsSync('.env.local')) {
    const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

// Init Firebase
if (getApps().length === 0) {
    const serviceAccountBase64 = process.env.SERVICE_ACCOUNT_BASE64;
    if (!serviceAccountBase64) {
        throw new Error('SERVICE_ACCOUNT_BASE64 environment variable is required');
    }
    const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf-8'));
    initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

const SPANISH_MONTHS: Record<string, number> = {
    'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
    'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
};

function parseSpanishDateToUTC(dateStr: string, timeStr: string, country: 'Valladolid' | 'India'): Date | null {
    try {
        const parts = dateStr.toLowerCase().split(' de ');
        if (parts.length < 2) return null;

        const day = parseInt(parts[0]);
        const monthYear = parts[1].split(', ');
        if (monthYear.length < 2) return null;

        const monthName = monthYear[0].trim();
        const year = parseInt(monthYear[1]);
        const monthIndex = SPANISH_MONTHS[monthName];

        if (monthIndex === undefined || isNaN(day) || isNaN(year)) return null;

        const [hours, minutes] = (timeStr || '00:00').split(':').map(Number);

        const offset = country === 'Valladolid' ? '+02:00' : '+05:30';
        const isoString = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours || 0).padStart(2, '0')}:${String(minutes || 0).padStart(2, '0')}:00${offset}`;

        const date = new Date(isoString);
        return isNaN(date.getTime()) ? null : date;
    } catch (error) {
        console.error('Error parsing Spanish date:', error);
        return null;
    }
}

async function fixTimezones() {
    console.log('🔍 Starting Firestore Timezone Migration...');
    const eventsRef = db.collection('timeline_events');
    const snapshot = await eventsRef.get();

    let updatedCount = 0;
    let totalDocs = snapshot.size;

    for (const doc of snapshot.docs) {
        const data = doc.data();
        const country = data.country as 'Valladolid' | 'India';
        const dateStr = data.date;
        const timeStr = data.time;

        console.log(`   🕒 Processing event: "${data.title}" (${country})`);
        const newFullDate = parseSpanishDateToUTC(dateStr, timeStr, country);

        if (newFullDate) {
            // Check if it's actually different from current one (optional but safer)
            await doc.ref.update({
                fullDate: newFullDate,
                updatedAt: new Date()
            });
            updatedCount++;
            console.log(`   ✅ Updated fullDate to: ${newFullDate.toISOString()}`);
        } else {
            console.log(`   ⚠️ Could not parse date for event: ${doc.id}`);
        }
    }

    console.log(`\n🎉 Migration Complete!`);
    console.log(`📊 Total Documents Scanned: ${totalDocs}`);
    console.log(`📈 Total Documents Updated: ${updatedCount}`);
}

fixTimezones()
    .then(() => {
        console.log('✨ Success!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Migration Failed:', error);
        process.exit(1);
    });
