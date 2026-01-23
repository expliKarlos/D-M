/**
 * Check Supabase Storage policies for timeline-images bucket
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkBucketPolicies() {
    try {
        console.log('\n🔍 Checking timeline-images bucket configuration...\n');

        // List buckets
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();

        if (listError) {
            console.error('❌ Error listing buckets:', listError);
            process.exit(1);
        }

        const bucket = buckets?.find(b => b.name === 'timeline-images');

        if (!bucket) {
            console.error('❌ Bucket "timeline-images" not found!');
            console.log('\n💡 Run: npx tsx scripts/create-timeline-bucket.js');
            process.exit(1);
        }

        console.log('✅ Bucket found:');
        console.log('   Name:', bucket.name);
        console.log('   Public:', bucket.public);
        console.log('   Created:', bucket.created_at);

        // Test upload permissions
        console.log('\n📤 Testing upload permission...');
        const testFile = new Blob(['test'], { type: 'text/plain' });
        const testFilename = `test-${Date.now()}.txt`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('timeline-images')
            .upload(testFilename, testFile, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('❌ Upload test FAILED:', uploadError.message);
            console.log('\n⚠️  You need to configure RLS policies in Supabase Dashboard:');
            console.log('   1. Go to: https://supabase.com/dashboard/project/[your-project]/storage/buckets');
            console.log('   2. Click on timeline-images bucket');
            console.log('   3. Go to "Policies" tab');
            console.log('   4. Add these policies:');
            console.log('      - INSERT: Allow authenticated users OR public');
            console.log('      - SELECT: Allow public');
        } else {
            console.log('✅ Upload test PASSED');

            // Clean up test file
            await supabase.storage
                .from('timeline-images')
                .remove([testFilename]);

            console.log('🧹 Test file cleaned up');
        }

        // Test read permissions
        console.log('\n📥 Testing read permission...');
        const { data: files, error: listFilesError } = await supabase.storage
            .from('timeline-images')
            .list();

        if (listFilesError) {
            console.error('❌ Read test FAILED:', listFilesError.message);
        } else {
            console.log('✅ Read test PASSED');
            console.log(`   Files in bucket: ${files?.length || 0}`);
        }

        console.log('\n✨ Diagnostic complete!');

    } catch (error) {
        console.error('❌ Unexpected error:', error);
        process.exit(1);
    }
}

checkBucketPolicies()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('💥 Diagnostic failed:', error);
        process.exit(1);
    });
