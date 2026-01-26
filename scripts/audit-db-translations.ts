import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { VertexAI } from '@google-cloud/vertexai';
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
const project = (process.env.VERTEX_PROJECT_ID || '').trim();
const location = (process.env.VERTEX_LOCATION || 'europe-west1').trim();

function getAuthOptions() {
    if (process.env.SERVICE_ACCOUNT_BASE64) {
        const json = Buffer.from(process.env.SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8');
        return { credentials: JSON.parse(json) };
    }
    return undefined;
}

async function translateContent(text: string) {
    if (!project) return null;

    try {
        const vertexAI = new VertexAI({ project, location, googleAuthOptions: getAuthOptions() });
        const model = vertexAI.getGenerativeModel({
            model: 'gemini-2.5-flash-lite',
            generationConfig: { responseMimeType: 'application/json', temperature: 0.2 }
        });

        const prompt = `
            CONTEXT: This is for the wedding app of Maria and Digvijay.
            STYLE GUIDELINES for translations:
            - Tone: Joyful, welcoming, and premium.
            - Spanish (es): Elegant and warm ("cercano").
            - English (en): Modern and fluent.
            - Hindi (hi): Respectful and traditional. Use Devanagari script.
            - Terminology: Preserve Indian ritual names. Do NOT translate "Sangeet" (keep it as "Sangeet"). Respect names of locations in Valladolid.

            TASK: Translate the following wedding content: "${text}"
            Return ONLY a JSON object:
            {
              "es": "...",
              "en": "...",
              "hi": "..."
            }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.candidates?.[0].content.parts[0].text;
        if (!responseText) return null;

        const cleanJson = responseText.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error('❌ AI Translation failed:', error);
        return null;
    }
}

async function auditDatabase() {
    console.log('🔍 Starting Firestore Translation Audit...');
    const eventsRef = db.collection('timeline_events');
    const snapshot = await eventsRef.get();

    let updatedCount = 0;
    let totalDocs = snapshot.size;

    for (const doc of snapshot.docs) {
        const data = doc.data();
        let needsUpdate = false;
        const updates: any = {};

        // Check titles
        if (!data.title_es || !data.title_en || !data.title_hi) {
            console.log(`   ✨ Translating missing titles for event: "${data.title}"`);
            const tr = await translateContent(data.title);
            if (tr) {
                if (!data.title_es) updates.title_es = tr.es;
                if (!data.title_en) updates.title_en = tr.en;
                if (!data.title_hi) updates.title_hi = tr.hi;
                needsUpdate = true;
            }
        }

        // Check descriptions
        if (!data.description_es || !data.description_en || !data.description_hi) {
            console.log(`   ✨ Translating missing descriptions for event: "${data.title}"`);
            const tr = await translateContent(data.description);
            if (tr) {
                if (!data.description_es) updates.description_es = tr.es;
                if (!data.description_en) updates.description_en = tr.en;
                if (!data.description_hi) updates.description_hi = tr.hi;
                needsUpdate = true;
            }
        }

        if (needsUpdate) {
            updates.updatedAt = new Date();
            await doc.ref.update(updates);
            updatedCount++;
            console.log(`   ✅ Updated document: ${doc.id}`);
        }
    }

    console.log(`\n🎉 Audit Complete!`);
    console.log(`📊 Total Documents Scanned: ${totalDocs}`);
    console.log(`📈 Total Documents Updated: ${updatedCount}`);

    return { totalDocs, updatedCount };
}

auditDatabase()
    .then((res) => {
        console.log('✨ Success!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Audit Failed:', error);
        process.exit(1);
    });
