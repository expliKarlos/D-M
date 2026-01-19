
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const content = fs.readFileSync(envPath, 'utf-8');

let newContent = content;

if (!content.includes('VERTEX_PROJECT_ID')) {
    newContent += '\nVERTEX_PROJECT_ID=digvijay-y-maria';
    console.log('Adding VERTEX_PROJECT_ID');
}

if (!content.includes('VERTEX_LOCATION')) {
    newContent += '\nVERTEX_LOCATION=europe-west1';
    console.log('Adding VERTEX_LOCATION');
}

if (newContent !== content) {
    fs.writeFileSync(envPath, newContent);
    console.log('Updated .env.local');
} else {
    console.log('.env.local already up to date');
}
