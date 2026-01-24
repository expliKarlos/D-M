import { NextResponse } from 'next/server';
import { translateText } from '@/lib/services/vertex-ai';

export async function POST(request: Request) {
    try {
        const { text } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const translations = await translateText(text);
        return NextResponse.json(translations);
    } catch (error) {
        console.error('[API Translate Error]:', error);
        return NextResponse.json({ error: 'Failed to translate text' }, { status: 500 });
    }
}
