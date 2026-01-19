import { supabase } from '@/lib/services/supabase';
import { getEmbedding } from '@/lib/services/vertex-ai';

export async function searchKnowledge(query: string) {
    try {
        // 1. Generate embedding for the query
        const queryEmbedding = await getEmbedding(query);

        // 2. Search in Supabase using the RPC function
        const { data: documents, error } = await supabase.rpc('match_documents', {
            query_embedding: queryEmbedding,
            match_threshold: 0.5, // Adjust based on testing
            match_count: 5
        });

        if (error) {
            console.error('Error matching documents:', error);
            return [];
        }

        return documents;
    } catch (error) {
        console.error('Error in searchKnowledge:', error);
        return [];
    }
}
