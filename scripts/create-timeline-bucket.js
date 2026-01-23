/**
 * Script to create timeline-images bucket in Supabase Storage
 * Run with: node scripts/create-timeline-bucket.js
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTimelineBucket() {
    try {
        console.log('🗂️  Creating timeline-images bucket...\n');

        // Check if bucket already exists
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();

        if (listError) {
            console.error('❌ Error listing buckets:', listError);
            process.exit(1);
        }

        const bucketExists = buckets?.some(b => b.name === 'timeline-images');

        if (bucketExists) {
            console.log('✅ Bucket "timeline-images" already exists');
        } else {
            // Create bucket
            const { data, error } = await supabase.storage.createBucket('timeline-images', {
                public: true,
                fileSizeLimit: 5242880, // 5MB
                allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
            });

            if (error) {
                console.error('❌ Error creating bucket:', error);
                process.exit(1);
            }

            console.log('✅ Bucket "timeline-images" created successfully');
        }

        // Set bucket policy (public read)
        console.log('\n📋 Bucket Configuration:');
        console.log('   - Public: Yes (read access)');
        console.log('   - Max file size: 5MB');
        console.log('   - Allowed types: JPEG, PNG, WebP');
        console.log('\n⚠️  Note: You may need to configure RLS policies in Supabase Dashboard');
        console.log('   Go to: Storage → timeline-images → Policies');
        console.log('   Add policy: Allow public SELECT (read) access');

    } catch (error) {
        console.error('❌ Unexpected error:', error);
        process.exit(1);
    }
}

createTimelineBucket()
    .then(() => {
        console.log('\n✨ Bucket setup complete!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Setup failed:', error);
        process.exit(1);
    });
