import { NextResponse } from 'next/server';
import { validateWeddingImage } from '@/lib/services/vertex-ai';
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

        const db = adminDb();
        if (!db) throw new Error('Firebase Admin DB not initialized');

        // 1. Check AI Toggle in Firestore
        const configRef = db.collection('settings').doc('app_config');
        const configSnap = await configRef.get();
        const aiEnabled = configSnap.exists ? configSnap.data()?.ai_validation_enabled : true;

        let isValid = true;
        let aiReason = 'Publicado directamente';

        // 2. Run AI Validation if enabled
        if (aiEnabled && type === 'photo') {
            const aiResult = await validateWeddingImage(imageUrl);
            isValid = aiResult.valid;
            aiReason = aiResult.reason;
        }

        // 3. If valid (or toggle OFF), write to Social Wall
        if (isValid) {
            const { error: supabaseError } = await supabase
                .from('social_wall')
                .insert({
                    type,
                    content: imageUrl || text,
                    author: author || 'Invitado',
                    user_id: userId || 'anonymous',
                    timestamp: Date.now(),
                    approved: true, // Auto-approved by AI or by toggle OFF
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
        }

        // 4. Return rejection message if AI failed
        return NextResponse.json({
            valid: false,
            message: `¡Casi! ${aiReason}. Intenta con otra toma que tenga más luz para que luzca en el muro gigante.`,
            action: 'rejected'
        });

    } catch (error: unknown) {
        console.error('[Validate Image API Error]:', error);
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        return NextResponse.json({
            valid: false,
            message: 'Error en el procesamiento. Inténtalo de nuevo.',
            error: errorMessage
        }, { status: 500 });
    }
}
