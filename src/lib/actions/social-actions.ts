'use server';

import { translateText } from '@/lib/services/vertex-ai';

export async function translateWallMessage(text: string, targetLocale: string) {
    try {
        // Since translateText returns all languages, we just pick the target one
        const translations = await translateText(text);

        // We handle targetLocale mapping
        // pa is punjabi, not usually in targetLocale but good to have
        const translation = translations[targetLocale as keyof typeof translations] || translations['en'];

        return { success: true, translation };
    } catch (error) {
        console.error('Translation Action Error:', error);
        return { success: false, error: 'Failed to translate' };
    }
}
