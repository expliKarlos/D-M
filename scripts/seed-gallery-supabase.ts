import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

config({ path: '.env.local' });

/**
 * SUPABASE-ONLY VERSION
 * Seeds gallery with test images using only Supabase (Storage + Database)
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedGallery() {
    const testGalleryPath = path.join(process.cwd(), 'public', 'test-gallery');

    const files = fs.readdirSync(testGalleryPath)
        .filter(file => /\.(png|jpe?g)$/i.test(file))
        .slice(0, 10);

    console.log(`📸 Found ${files.length} images to upload...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const [index, filename] of files.entries()) {
        try {
            const filePath = path.join(testGalleryPath, filename);
            const fileBuffer = fs.readFileSync(filePath);

            const ext = path.extname(filename);
            const uniqueName = `seed-${Date.now()}-${index}${ext}`;
            const storagePath = `participation-gallery/${uniqueName}`;

            console.log(`⬆️  Uploading ${filename}...`);

            // Upload to Supabase Storage
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

            const { data: { publicUrl } } = supabase.storage
                .from('photos')
                .getPublicUrl(storagePath);

            console.log(`   ✅ Uploaded to: ${publicUrl}`);

            // Insert metadata into Supabase Database
            console.log(`   📝 Creating database record...`);

            const { data: dbData, error: dbError } = await supabase
                .from('social_wall')
                .insert({
                    type: 'photo',
                    content: publicUrl,
                    author: 'Galería Demo',
                    user_id: 'seed-script',
                    timestamp: Date.now() - (files.length - index) * 60000,
                    approved: true,
                })
                .select()
                .single();

            if (dbError) {
                console.error(`   ❌ Database error: ${dbError.message}`);
                console.error(`   Code: ${dbError.code}`);
                throw dbError;
            }

            console.log(`   ✅ Created record: ${dbData.id}\n`);
            successCount++;

            await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error: any) {
            console.error(`   ❌ Error processing ${filename}:`);
            console.error(`      ${error.message}\n`);
            errorCount++;
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✨ Seed Complete!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log('='.repeat(50));
}

seedGallery()
    .then(() => {
        console.log('\n🎉 Gallery seeded successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Seed failed:', error);
        process.exit(1);
    });
