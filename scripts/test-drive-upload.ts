import { getResumableUploadUrl } from '../src/lib/services/google-drive';
import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: '.env.local' });

async function testDriveUpload() {
    console.log('🚀 Starting Drive Upload Test...');

    // Mock Data
    const fileName = 'test-upload-script-' + Date.now() + '.txt';
    const mimeType = 'text/plain';
    const folderId = '1Q_VfZnAp8bAeaccXHjUsJFgUfPn_RlpB'; // Master Folder

    try {
        // 1. Generate URL
        console.log(`1️⃣  Generating Resumable URL for ${fileName}...`);
        const uploadUrl = await getResumableUploadUrl(fileName, mimeType, folderId);
        console.log('   ✅ URL Generated:', uploadUrl.substring(0, 50) + '...');

        // 2. Upload Dummy Content
        console.log('2️⃣  Uploading dummy content...');
        const content = 'This is a test file from the deployment script.';

        const res = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': mimeType,
                'Content-Length': String(Buffer.byteLength(content))
            },
            body: content
        });

        if (res.ok) {
            const data = await res.json();
            console.log('   ✅ Upload Successful!');
            console.log('   📄 File ID:', data.id);
            console.log('   📂 Name:', data.name);
        } else {
            console.error('   ❌ Upload Failed:', res.status, res.statusText);
            const text = await res.text();
            console.error('   Body:', text);
        }

    } catch (error) {
        console.error('💥 Test Failed:', error);
    }
}

testDriveUpload();
