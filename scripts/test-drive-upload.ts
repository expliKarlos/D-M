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
    const content = 'This is a test file from the deployment script.';
    const fileSize = Buffer.byteLength(content);

    try {
        // 1. Generate URL
        console.log(`1️⃣  Generating Resumable URL for ${fileName}...`);
        const uploadUrl = await getResumableUploadUrl(fileName, mimeType, fileSize, folderId);
        console.log('   ✅ URL Generated:', uploadUrl.substring(0, 50) + '...');

        // 2. Upload Dummy Content
        console.log('2️⃣  Uploading dummy content...');

        const res = await fetch(uploadUrl, {
            method: 'PUT',
            // Server-side script doesn't have CORS issues, but keeping it clean or matching app logic is fine.
            // But if we defined X-Upload-Content-Type, we theoretically don't need Content-Type here if session is strict?
            // Drive API behavior for backend scripts might differ slightly, but let's send body.
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
