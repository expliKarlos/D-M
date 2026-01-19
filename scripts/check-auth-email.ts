
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

if (process.env.SERVICE_ACCOUNT_BASE64) {
    try {
        const json = Buffer.from(process.env.SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8');
        const credentials = JSON.parse(json);
        console.log('Service Account Email:', credentials.client_email);
        console.log('Project ID in Creds:', credentials.project_id);
    } catch (e) {
        console.error('Failed to parse credentials:', e);
    }
} else {
    console.log('SERVICE_ACCOUNT_BASE64 not found.');
}
