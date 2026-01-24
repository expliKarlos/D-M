import { NextResponse } from 'next/server';
import { translateImageText } from '@/lib/services/vertex-ai';

export async function POST(request: Request) {
    try {
        const { image, mimeType } = await request.json();

        if (!image) {
            return NextResponse.json({ error: 'Image is required' }, { status: 400 });
        }

        // image is expected to be base64 string without the prefix
        const translation = await translateImageText(image, mimeType || 'image/jpeg');
        return NextResponse.json({ translation });
    } catch (error) {
        console.error('[API Camera Translate Error]:', error);
        return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
    }
}
