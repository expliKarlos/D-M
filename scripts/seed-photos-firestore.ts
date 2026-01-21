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
    projectId: 'boda-digvijay-maria'
});
const db = getFirestore(app, '(default)');

async function seedPhotosToFirestore() {
    const targetProjectId = 'boda-digvijay-maria';
    console.log(`🚀 Seeding to project: ${targetProjectId}`);

    const testGalleryPath = path.join(process.cwd(), 'public', 'test-gallery');
    const files = fs.readdirSync(testGalleryPath)
        .filter(file => /\.(png|jpe?g)$/i.test(file))
        .slice(0, 5);

    console.log(`📸 Uploading ${files.length} photos to Supabase...`);

    for (const [index, filename] of files.entries()) {
        const filePath = path.join(testGalleryPath, filename);
        const fileBuffer = fs.readFileSync(filePath);
        const ext = path.extname(filename).slice(1);
        const uniqueName = `seed-gall-${Date.now()}-${index}.${ext}`;
        const storagePath = `participation-gallery/${uniqueName}`;

        try {
            // A. Upload to Supabase (photos bucket)
            const { error: uploadError } = await supabase.storage
                .from('photos')
                .upload(storagePath, fileBuffer, { contentType: `image/${ext}` });

            if (uploadError) {
                console.error(`❌ Supabase error for ${filename}:`, uploadError.message);
                continue;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('photos')
                .getPublicUrl(storagePath);

            // B. Save Metadata to Firestore (photos collection)
            const photoData = {
                url: publicUrl,
                authorId: 'admin-seed',
                moment: index % 2 === 0 ? 'Fiesta' : 'Ceremonia',
                likesCount: Math.floor(Math.random() * 50),
                liked_by: [],
                timestamp: Date.now() - index * 60000
            };

            await db.collection('photos').add(photoData);
            console.log(`✅ Seeded Photo: ${filename} -> ${publicUrl}`);
        } catch (err: any) {
            console.error(`❌ Error seeding ${filename}:`, err.message);
        }
    }

    console.log('\n📝 Seeding 3 sample wishes...');
    const wishes = [
        { message: "¡Muchas felicidades a los novios! Que este viaje a la India sea solo el comienzo de una aventura eterna. ❤️", author: "Marco Polo", color: "#FF9933" },
        { message: "Que la magia del Holi llene sus vidas de colores y alegría siempre. ¡Os queremos! ✨", author: "Familia García", color: "#F21B6A" },
        { message: "¡A disfrutar de la boda más esperada del año! Nos vemos en la pista. 🕺💃", author: "Los Primos", color: "#3B82F6" }
    ];

    for (const [index, wish] of wishes.entries()) {
        try {
            const wishData = {
                text: wish.message,
                authorName: wish.author,
                imageUrl: null, // Test-only text wishes for now
                colorCard: wish.color,
                likesCount: 0,
                liked_by: [],
                timestamp: Date.now() - (index + 10) * 1000,
                rotation: Math.floor(Math.random() * 6) - 3
            };

            await db.collection('wishes').add(wishData);
            console.log(`✅ Seeded Wish: "${wish.message.substring(0, 20)}..."`);
        } catch (err: any) {
            console.error(`❌ Error seeding wish:`, err.message);
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
