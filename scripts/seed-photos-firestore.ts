import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';

config({ path: '.env.local' });

console.log('--- Debug Info ---');
console.log('Supabase URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Firebase Base64 exists:', !!process.env.SERVICE_ACCOUNT_BASE64);
console.log('------------------');

// 1. Supabase Setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 2. Firebase Admin Setup
const serviceAccount = JSON.parse(
    Buffer.from(process.env.SERVICE_ACCOUNT_BASE64!, 'base64').toString()
);

const app = initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
});
const db = getFirestore(app, '(default)');

async function seedPhotosToFirestore() {
    const testGalleryPath = path.join(process.cwd(), 'public', 'test-gallery');
    const files = fs.readdirSync(testGalleryPath)
        .filter(file => /\.(png|jpe?g)$/i.test(file))
        .slice(0, 5); // Just 5 for testing

    console.log(`🚀 Seeding ${files.length} photos to Firestore...`);

    for (const [index, filename] of files.entries()) {
        const filePath = path.join(testGalleryPath, filename);
        const fileBuffer = fs.readFileSync(filePath);
        const ext = path.extname(filename).slice(1);
        const uniqueName = `sample-${Date.now()}-${index}.${ext}`;
        const storagePath = `participation-gallery/${uniqueName}`;

        // A. Upload to Supabase (photos bucket)
        const { error: uploadError } = await supabase.storage
            .from('photos')
            .upload(storagePath, fileBuffer, { contentType: `image/${ext}` });

        if (uploadError) {
            console.error(`❌ Upload error for ${filename}:`, uploadError.message);
            continue;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('photos')
            .getPublicUrl(storagePath);

        // B. Save Metadata to Firestore
        try {
            const photoData = {
                url: publicUrl,
                authorId: 'admin-seed',
                moment: index % 2 === 0 ? 'Fiesta' : 'Ceremonia',
                likesCount: Math.floor(Math.random() * 50),
                liked_by: [],
                timestamp: Date.now() - index * 3600000
            };

            await db.collection('photos').add(photoData);
            console.log(`✅ Seeded ${filename} -> ${publicUrl}`);
        } catch (firebaseErr: any) {
            console.error(`❌ Firestore error for ${filename}:`, firebaseErr.message);
        }
    }

    console.log('\n✨ Seeding completed!');
}

seedPhotosToFirestore()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('💥 Crash:', err);
        process.exit(1);
    });
