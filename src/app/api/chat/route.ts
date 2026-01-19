import { NextRequest, NextResponse } from 'next/server';
import { chatWithConcierge } from '@/lib/services/vertex-ai';

export async function POST(req: NextRequest) {
    try {
        // Parse body
        const body = await req.json();
        const { message, history } = body;

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // Call Vertex AI service
        const responseText = await chatWithConcierge(message, history || []);

        return NextResponse.json({ response: responseText });
    } catch (error) {
        console.error('Error in chat route:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
