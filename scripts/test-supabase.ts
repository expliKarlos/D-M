import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSupabase() {
    console.log('🔍 Testing Supabase Storage...\n');

    // List buckets
    console.log('1. Listing buckets...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
        console.error('   ❌ Error listing buckets:', listError.message);
        return;
    }

    console.log(`   ✅ Found ${buckets.length} buckets:`);
    buckets.forEach(b => console.log(`      - ${b.name} (${b.public ? 'public' : 'private'})`));

    // Check if 'photos' bucket exists
    const photosBucket = buckets.find(b => b.name === 'photos');
    if (!photosBucket) {
        console.log('\n   ⚠️  "photos" bucket not found!');
        console.log('   Available buckets:', buckets.map(b => b.name).join(', '));
        return;
    }

    console.log('\n2. Testing upload to "photos" bucket...');

    // Try a simple test upload
    const testContent = 'test content';
    const testPath = `test-${Date.now()}.txt`;

    const { data, error: uploadError } = await supabase.storage
        .from('photos')
        .upload(testPath, testContent, {
            contentType: 'text/plain'
        });

    if (uploadError) {
        console.error('   ❌ Upload failed:', uploadError.message);
        console.error('   Full error:', uploadError);
        return;
    }

    console.log('   ✅ Upload successful!');
    console.log('   Path:', data.path);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(testPath);

    console.log('   ✅ Public URL:', publicUrl);

    // Clean up test file
    await supabase.storage.from('photos').remove([testPath]);
    console.log('   ✅ Test file cleaned up\n');

    console.log('🎉 All tests passed! Bucket is ready for seeding.');
}

testSupabase()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('💥 Test failed:', error);
        process.exit(1);
    });
