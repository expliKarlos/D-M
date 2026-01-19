import { createClient } from '@supabase/supabase-js';
import { VertexAI } from '@google-cloud/vertexai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleAuth } from 'google-auth-library';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Supabase Setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Must use service key for ingestion
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Vertex AI Setup
const project = process.env.VERTEX_PROJECT_ID!;
const location = process.env.VERTEX_LOCATION || 'europe-west1';
// const vertexAI = new VertexAI({ project, location }); // Not used for embedding in this script anymore

async function getEmbedding(text: string): Promise<number[]> {
    try {
        let credentials;
        if (process.env.SERVICE_ACCOUNT_BASE64) {
            try {
                const json = Buffer.from(process.env.SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8');
                credentials = JSON.parse(json);
            } catch (e) {
                console.warn('Failed to parse SERVICE_ACCOUNT_BASE64:', e);
            }
        }

        const auth = new GoogleAuth({
            scopes: 'https://www.googleapis.com/auth/cloud-platform',
            credentials
        });
        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();
        const token = accessToken.token;

        if (!token) throw new Error('Failed to get access token from GoogleAuth');

        const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/text-embedding-004:predict`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                instances: [{ content: text }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Vertex AI API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result = (await response.json()) as any;
        const embedding = result.predictions?.[0]?.embeddings?.values;

        if (!embedding) throw new Error('No embedding returned from API response');
        return embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw error;
    }
}

async function ingestKnowledge() {
    const knowledgeDir = path.join(process.cwd(), 'public', 'knowledge');

    if (!fs.existsSync(knowledgeDir)) {
        console.log('Knowledge directory not found, creating it...');
        fs.mkdirSync(knowledgeDir, { recursive: true });
        // Create a dummy file
        fs.writeFileSync(path.join(knowledgeDir, 'ejemplo.md'), '# Ejemplo de Protocolo\n\nEste es un contenido de ejemplo.');
    }

    // Recursive function to get all markdown files
    function getMarkdownFiles(dir: string): string[] {
        let results: string[] = [];
        const list = fs.readdirSync(dir);
        list.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat && stat.isDirectory()) {
                results = results.concat(getMarkdownFiles(filePath));
            } else if (file.endsWith('.md')) {
                results.push(filePath);
            }
        });
        return results;
    }

    const files = getMarkdownFiles(knowledgeDir);

    console.log(`Found ${files.length} markdown files.`);

    for (const filePath of files) {
        const fileName = path.basename(filePath);
        console.log(`Processing ${fileName}...`);
        try {
            const fileContent = fs.readFileSync(filePath, 'utf-8');

            // Extract H1 (Title)
            const titleMatch = fileContent.match(/^#\s+(.+)$/m);
            const title = titleMatch ? titleMatch[1] : fileName.replace('.md', '');

            // Remove title from content for cleaner embedding
            const content = fileContent.replace(/^#\s+.+$/m, '').trim();

            console.log(`Generating embedding for: ${title}`);
            // Generate Embedding
            const embedding = await getEmbedding(`${title}\n${content}`);
            console.log(`Embedding generated. Length: ${embedding.length}`);

            // Check for Infographics
            const filenameNoExt = fileName.replace('.md', '');
            const infografiaDir = path.join(process.cwd(), 'public', 'infografias', filenameNoExt);
            const images: string[] = [];

            if (fs.existsSync(infografiaDir)) {
                const mediaFiles = fs.readdirSync(infografiaDir);
                mediaFiles.forEach(media => {
                    if (/\.(jpg|jpeg|png|webp)$/i.test(media)) {
                        images.push(`/infografias/${filenameNoExt}/${media}`);
                    }
                });
            }

            console.log(`Upserting to Supabase... Media count: ${images.length}`);

            // Insert into Supabase

            // Delete existing records for this file to avoid duplication
            await supabase.from('wedding_knowledge').delete().eq('metadata->source_file', path.relative(knowledgeDir, filePath));

            // Insert into Supabase
            const { error } = await supabase.from('wedding_knowledge').insert({
                content: content,
                embedding: embedding,
                metadata: {
                    title: title,
                    source_file: path.relative(knowledgeDir, filePath),
                    media_urls: images,
                    type: 'markdown'
                }
            });

            if (error) {
                console.error(`Error inserting ${fileName}:`, error);
            } else {
                console.log(`Successfully ingested: ${title}`);
            }
        } catch (err) {
            console.error(`FAILED processing ${fileName}:`, err);
        }
    }
}

ingestKnowledge().catch(console.error);
