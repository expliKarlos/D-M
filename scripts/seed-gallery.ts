import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env.local
config({ path: '.env.local' });

/**
 * Script to seed the gallery with test images
 * Uploads images from public/test-gallery to Supabase Storage
 * Creates corresponding Firestore documents in social_wall collection
 */

// --- Supabase Setup ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // You'll need to add this to .env.local

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.log('Required:');
    console.log('  - NEXT_PUBLIC_SUPABASE_URL');
    console.log('  - SUPABASE_SERVICE_ROLE_KEY (from Supabase Dashboard > Settings > API)');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// --- Firebase Admin Setup ---
const serviceAccountBase64 = process.env.SERVICE_ACCOUNT_BASE64;
if (!serviceAccountBase64) {
    console.error('❌ Missing SERVICE_ACCOUNT_BASE64 in .env.local');
    process.exit(1);
}

const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf8'));

if (getApps().length === 0) {
    initializeApp({
        credential: cert(serviceAccount),
        databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
}

// Use the DEFAULT database (required for client SDK compatibility)
const db = getFirestore(); // This uses (default)
db.settings({ ignoreUndefinedProperties: true });

console.log(`🔥 Firebase initialized for project: ${serviceAccount.project_id}`);
console.log(`📂 Using database: (default)\n`);

// --- Seed Function ---
async function seedGallery() {
    const testGalleryPath = path.join(process.cwd(), 'public', 'test-gallery');

    if (!fs.existsSync(testGalleryPath)) {
        console.error(`❌ Directory not found: ${testGalleryPath}`);
        return;
    }

    // 0. Seed Moments (Folders)
    const DEFAULT_MOMENTS = [
        { id: 'pedida', name: 'Pedida', icon: '💍', order: 0 },
        { id: 'ceremonia', name: 'Ceremonia', icon: '⛪', order: 1 },
        { id: 'banquete', name: 'Banquete', icon: '🥂', order: 2 },
        { id: 'fiesta', name: 'Fiesta', icon: '💃', order: 3 },
    ];

    console.log('📂 Seeding moments...');
    for (const m of DEFAULT_MOMENTS) {
        await db.collection('moments').doc(m.id).set(m, { merge: true });
    }
    console.log('✅ Moments seeded.\n');

    // Read ALL files from test-gallery
    const files = fs.readdirSync(testGalleryPath)
        .filter(file => /\.(png|jpe?g|webp)$/i.test(file));

    console.log(`📸 Found ${files.length} images to sync with cloud storage...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const [index, filename] of files.entries()) {
        try {
            const filePath = path.join(testGalleryPath, filename);
            const fileBuffer = fs.readFileSync(filePath);

            // Use original filename to allow for easier recognition, but cleaned
            const ext = path.extname(filename).toLowerCase();
            const cleanName = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const storagePath = `participation-gallery/seed_${cleanName}`;

            console.log(`⬆️  Processing ${filename}...`);

            // 1. Upload to Supabase (upsert true to allow re-runs)
            const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';
            const { data, error: uploadError } = await supabase.storage
                .from('photos')
                .upload(storagePath, fileBuffer, {
                    contentType,
                    upsert: true
                });

            if (uploadError) {
                console.error(`   ❌ Upload failed: ${uploadError.message}`);
                errorCount++;
                continue;
            }

            // 2. Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('photos')
                .getPublicUrl(storagePath);

            console.log(`   ✅ Supabase URL: ${publicUrl}`);

            // 3. Create/Update Firestore document
            // We use a predefined ID to avoid duplicates if re-running
            const docId = `seed_${filename.replace(/\W/g, '_')}`;
            const photoData = {
                url: publicUrl,
                content: publicUrl,
                author: 'Galería Oficial',
                authorId: 'seed-admin',
                moment: ['ceremonia', 'banquete', 'fiesta', 'pedida'][index % 4],
                likesCount: Math.floor(Math.random() * 50),
                liked_by: [],
                timestamp: Date.now() - (files.length - index) * 1000 * 60 * 60, // Stagger by hour
                approved: true,
            };

            await db.collection('photos').doc(docId).set(photoData, { merge: true });
            console.log(`   📝 Firestore document synced: ${docId}\n`);

            successCount++;
            await new Promise(resolve => setTimeout(resolve, 300));

        } catch (error: any) {
            console.error(`   ❌ Error processing ${filename}: ${error.message}\n`);
            errorCount++;
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✨ Global Seed Complete!`);
    console.log(`   Processed: ${successCount}`);
    console.log(`   Failed: ${errorCount}`);
    console.log('='.repeat(50));
}

// Run the seed
seedGallery()
    .then(() => {
        console.log('\n🎉 Gallery seeded successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Seed failed:', error);
        process.exit(1);
    });
