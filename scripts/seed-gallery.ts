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
    });
}

const db = getFirestore();

// --- Seed Function ---
async function seedGallery() {
    const testGalleryPath = path.join(process.cwd(), 'public', 'test-gallery');

    // Read all files from test-gallery
    const files = fs.readdirSync(testGalleryPath)
        .filter(file => /\.(png|jpe?g)$/i.test(file))
        .slice(0, 10); // Only first 10 images

    console.log(`📸 Found ${files.length} images to upload...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const [index, filename] of files.entries()) {
        try {
            const filePath = path.join(testGalleryPath, filename);
            const fileBuffer = fs.readFileSync(filePath);

            // Generate unique filename
            const ext = path.extname(filename);
            const uniqueName = `seed-${Date.now()}-${index}${ext}`;
            const storagePath = `participation-gallery/${uniqueName}`;

            console.log(`⬆️  Uploading ${filename}...`);

            // Upload to Supabase
            const { data, error: uploadError } = await supabase.storage
                .from('photos')
                .upload(storagePath, fileBuffer, {
                    contentType: `image/${ext.slice(1)}`,
                    upsert: false
                });

            if (uploadError) {
                console.error(`   ❌ Upload failed: ${uploadError.message}`);
                errorCount++;
                continue;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('photos')
                .getPublicUrl(storagePath);

            console.log(`   ✅ Uploaded to: ${publicUrl}`);

            // Create Firestore document
            const docData = {
                type: 'photo',
                content: publicUrl,
                author: 'Galería Demo',
                userId: 'seed-script',
                timestamp: Date.now() - (files.length - index) * 60000, // Stagger timestamps
                approved: true,
            };

            await db.collection('social_wall').add(docData);
            console.log(`   ✅ Created Firestore document\n`);

            successCount++;

            // Small delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error: any) {
            console.error(`   ❌ Error processing ${filename}: ${error.message}\n`);
            errorCount++;
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✨ Seed Complete!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);
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
