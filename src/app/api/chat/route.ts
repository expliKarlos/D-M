import { NextRequest, NextResponse } from 'next/server';
import { streamChatWithConcierge } from '@/lib/services/vertex-ai';
import { searchKnowledge } from '@/lib/services/knowledge-base';
import { supabase } from '@/lib/services/supabase';
import { updateSession } from '@/lib/utils/supabase/middleware';

export const runtime = 'nodejs'; // Vertex AI Node SDK requires Node runtime

export async function POST(req: NextRequest) {
    try {
        // 1. Auth & Context
        // For accurate context, we'd ideally get the user session. 
        // Assuming client sends a session token via headers or cookies handled by supbase client.
        // For now, we'll extract context from the body if provided or just rely on public knowledge.

        const body = await req.json();
        const { message, history } = body;

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // 2. RAG: Search Knowledge Base
        console.log(`Searching knowledge for: ${message}`);
        const knowledgeDocs = await searchKnowledge(message);

        const contextText = knowledgeDocs
            .map(doc => `[Fuente: BBDD] ${doc.content}`)
            .join('\n\n');

        console.log(`Found ${knowledgeDocs.length} snippets.`);

        // 3. Init Stream
        const stream = await streamChatWithConcierge(message, contextText, history || []);

        // 4. Return ReadableStream
        const encoder = new TextEncoder();

        const customStream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        const text = chunk.candidates?.[0].content.parts[0].text;
                        if (text) {
                            controller.enqueue(encoder.encode(text));
                        }
                    }
                    controller.close();
                } catch (err) {
                    controller.error(err);
                }
            },
        });

        // Extract unique media URLs
        const allMedia = knowledgeDocs.flatMap(doc => doc.metadata.media_urls || []);
        const uniqueMedia = Array.from(new Set(allMedia));

        return new NextResponse(customStream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'X-Chat-Media-Urls': JSON.stringify(uniqueMedia)
            },
        });

    } catch (error) {
        console.error('Error in chat route:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
