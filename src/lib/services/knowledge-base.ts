import { supabase } from '@/lib/services/supabase';
import { getEmbedding } from '@/lib/services/vertex-ai';

export interface KnowledgeDocument {
    id: string;
    content: string;
    metadata: any;
    similarity: number;
}

export async function searchKnowledge(query: string): Promise<KnowledgeDocument[]> {
    try {
        // 1. Generate embedding for the query
        const queryEmbedding = await getEmbedding(query);

        // 2. Search in Supabase using the RPC function
        const { data: documents, error } = await supabase.rpc('match_documents', {
            query_embedding: queryEmbedding,
            match_threshold: 0.5,
            match_count: 5,
            query_text: query // Pass text for hybrid search
        });

        if (error) {
            console.error('Error matching documents:', error);
            return [];
        }

        return documents as KnowledgeDocument[];
    } catch (error) {
        console.error('Error in searchKnowledge:', error);
        return [];
    }
}
