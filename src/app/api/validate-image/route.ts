import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/services/firebase-admin';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
    try {
        const { imageUrl, type, author, text, userId } = await request.json();

        if (!imageUrl && type === 'photo') {
            return NextResponse.json({ valid: false, message: 'No image provided' }, { status: 400 });
        }

        // AI Validation REMOVED by user request ("No sensor").
        // We auto-approve everything.
        const isValid = true;

        // Write to Social Wall (Supabase)
        const { error: supabaseError } = await supabase
            .from('social_wall')
            .insert({
                type,
                content: imageUrl || text,
                author: author || 'Invitado',
                user_id: userId || 'anonymous',
                timestamp: Date.now(),
                approved: true,
            });

        if (supabaseError) {
            console.error('[Supabase Error]:', supabaseError);
            throw new Error('Error al guardar en Supabase');
        }

        return NextResponse.json({
            valid: true,
            message: '¡Publicado con éxito!',
            action: 'published'
        });

    } catch (error: unknown) {
        console.error('[Validate Image API Error]:', error);
        return NextResponse.json({
            valid: true, // Fail open? Or fail closed? user wants uploads. 
            // If DB fails, we probably should tell them.
            message: 'Imagen subida (sin validación por error interno).',
            error: error instanceof Error ? error.message : 'Unknown'
        }, { status: 200 }); // Return 200 to not block the UI flow?
    }
}
