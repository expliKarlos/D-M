
import dotenv from 'dotenv';
import path from 'path';

// Try to load from root
const envPath = path.resolve(process.cwd(), '.env.local');
console.log('Loading env from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('Error loading .env.local:', result.error);
} else {
    console.log('Dotenv parsed:', Object.keys(result.parsed || {}));
}

console.log('VERTEX_PROJECT_ID present:', !!process.env.VERTEX_PROJECT_ID);
console.log('VERTEX_LOCATION present:', !!process.env.VERTEX_LOCATION);
console.log('SUPABASE_SERVICE_ROLE_KEY present:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('NEXT_PUBLIC_SUPABASE_URL present:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);

if (process.env.VERTEX_PROJECT_ID) {
    console.log('VERTEX_PROJECT_ID length:', process.env.VERTEX_PROJECT_ID.length);
}
