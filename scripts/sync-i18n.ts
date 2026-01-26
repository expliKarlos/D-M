import fs from 'fs';
import path from 'path';
import { VertexAI } from '@google-cloud/vertexai';
import * as dotenv from 'dotenv';

// Load env vars from .env.local if it exists
if (fs.existsSync('.env.local')) {
    const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const MESSAGES_DIR = path.join(process.cwd(), 'messages');
const LOCALES = ['es', 'en', 'hi'];

const project = (process.env.VERTEX_PROJECT_ID || '').trim();
const location = (process.env.VERTEX_LOCATION || 'europe-west1').trim();

function getAuthOptions() {
    if (process.env.SERVICE_ACCOUNT_BASE64) {
        const json = Buffer.from(process.env.SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8');
        return { credentials: JSON.parse(json) };
    }
    return undefined;
}

async function translateMissingKeys(sourceText: string, targetLocales: string[]) {
    if (!project) {
        console.error('❌ Error: VERTEX_PROJECT_ID is not set.');
        return null;
    }

    try {
        const vertexAI = new VertexAI({ project, location, googleAuthOptions: getAuthOptions() });
        const model = vertexAI.getGenerativeModel({
            model: 'gemini-2.5-flash-lite',
            generationConfig: { responseMimeType: 'application/json' }
        });

        const prompt = `
            CONTEXT: This is for the wedding app of Maria and Digvijay.
            STYLE GUIDELINES for translations:
            - Tone: Joyful, welcoming, and premium.
            - Spanish (es): Elegant and warm ("cercano").
            - English (en): Modern and fluent.
            - Hindi (hi): Respectful and traditional. Use Devanagari script.
            - Terminology: Preserve Indian ritual names. Do NOT translate "Sangeet" (keep it as "Sangeet"). Respect names of locations in Valladolid.

            TASK: Translate the following UI text: "${sourceText}"
            Target languages: ${targetLocales.join(', ')}.
            
            Return ONLY a JSON object where keys are the locale codes and values are the translations.
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

function getDeepKeys(obj: any, prefix = ''): string[] {
    return Object.keys(obj).reduce((res: string[], el) => {
        if (Array.isArray(obj[el])) {
            return res;
        } else if (typeof obj[el] === 'object' && obj[el] !== null) {
            return [...res, ...getDeepKeys(obj[el], prefix + el + '.')];
        }
        return [...res, prefix + el];
    }, []);
}

function setDeepValue(obj: any, key: string, value: any) {
    const parts = key.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
}

function getDeepValue(obj: any, key: string) {
    return key.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
}

async function syncTranslations() {
    console.log('🚀 Starting i18n synchronization...');

    const translations: Record<string, any> = {};
    const allKeys = new Set<string>();

    // 1. Load all files and collect all keys
    for (const locale of LOCALES) {
        const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
        if (fs.existsSync(filePath)) {
            const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            translations[locale] = content;
            getDeepKeys(content).forEach(k => allKeys.add(k));
        } else {
            translations[locale] = {};
        }
    }

    console.log(`📊 Found ${allKeys.size} unique keys across all locales.`);

    // 2. Identify missing translations
    const missing: Record<string, { key: string, sourceValue: string, targetLocales: string[] }[]> = {};
    let missingCount = 0;

    for (const key of Array.from(allKeys)) {
        const missingForThisKey: string[] = [];
        let sourceValue = '';

        // Prioritize Spanish as source, then English
        sourceValue = getDeepValue(translations['es'], key) || getDeepValue(translations['en'], key) || getDeepValue(translations['hi'], key);

        for (const locale of LOCALES) {
            if (!getDeepValue(translations[locale], key)) {
                missingForThisKey.push(locale);
                missingCount++;
            }
        }

        if (missingForThisKey.length > 0) {
            if (!missing['batch']) missing['batch'] = [];
            missing['batch'].push({ key, sourceValue, targetLocales: missingForThisKey });
        }
    }

    if (missingCount === 0) {
        console.log('✅ All translations are in sync! No missing keys found.');
        return;
    }

    console.log(`🔍 Found ${missingCount} missing translation values. Processing with AI...`);

    // 3. Process missing keys (one by one for accuracy, but could be batched)
    for (const item of missing['batch']) {
        console.log(`   ✨ Translating key: "${item.key}" from "${item.sourceValue}"...`);
        const result = await translateMissingKeys(item.sourceValue, item.targetLocales);

        if (result) {
            for (const locale of item.targetLocales) {
                if (result[locale]) {
                    setDeepValue(translations[locale], item.key, result[locale]);
                }
            }
        }
    }

    // 4. Save files back (maintaining alphabetical order for clean diffs)
    const sortObject = (obj: any): any => {
        if (typeof obj !== 'object' || obj === null) return obj;
        return Object.keys(obj).sort().reduce((res: any, key) => {
            res[key] = sortObject(obj[key]);
            return res;
        }, {});
    };

    for (const locale of LOCALES) {
        const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
        const sortedContent = sortObject(translations[locale]);
        fs.writeFileSync(filePath, JSON.stringify(sortedContent, null, 2), 'utf-8');
        console.log(`💾 Saved ${locale}.json`);
    }

    console.log('🎉 Done! i18n files are now fully synchronized.');
}

syncTranslations().catch(console.error);
