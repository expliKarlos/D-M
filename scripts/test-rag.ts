
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

// Create a local Supabase client for this script
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use service key for test
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function searchKnowledge(query: string) {
    // Import dynamically to ensure env vars are loaded
    const { getEmbedding } = require('../src/lib/services/vertex-ai');

    // 1. Generate embedding for the query
    const queryEmbedding = await getEmbedding(query);

    // 2. Search in Supabase using the RPC function
    const { data: documents, error } = await supabase.rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_threshold: 0.5,
        match_count: 5,
        query_text: query
    });

    if (error) {
        console.error('Error matching documents:', error);
        return [];
    }

    return documents;
}

async function testRAG() {
    const query = "que vacunas necesito";
    console.log(`\n🔍 Testing Retrieval for query: "${query}"...`);

    try {
        const docs = await searchKnowledge(query);
        console.log(`✅ Found ${docs.length} documents.`);
        docs.forEach((doc: any, i: number) => {
            console.log(`   ${i + 1}. [${doc.similarity.toFixed(2)}] ${doc.metadata.title}`);
        });

        if (docs.length === 0) {
            console.error("❌ No documents found! Aborting generation test.");
            return;
        }

        const context = docs.map((d: any) => `[Fuente: ${d.metadata.source_file}] ${d.content}`).join('\n\n');

        console.log(`\n🤖 Testing Generation with context...`);

        const { streamChatWithConcierge } = require('../src/lib/services/vertex-ai');

        const stream = await streamChatWithConcierge(query, context, []);

        console.log("📝 Generating response...");
        let fullResponse = "";
        for await (const chunk of stream) {
            const text = chunk.candidates?.[0].content.parts[0].text;
            if (text) {
                process.stdout.write(text);
                fullResponse += text;
            }
        }
        console.log("\n\n✅ Generation complete.");

    } catch (error) {
        console.error("❌ Test Failed:", error);
    }
}

testRAG();
