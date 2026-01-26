'use server';

import { VertexAI } from '@google-cloud/vertexai';

const project = (process.env.VERTEX_PROJECT_ID || '').trim();
const location = (process.env.VERTEX_LOCATION || 'europe-west1').trim();

function getAuthOptions() {
    if (process.env.SERVICE_ACCOUNT_BASE64) {
        const json = Buffer.from(process.env.SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8');
        return { credentials: JSON.parse(json) };
    }
    return undefined;
}

export type TrilingualOutput = {
    es: string;
    en: string;
    hi: string;
};

/**
 * Universal Translation Logic: Detects language and translates to project locales (ES, EN, HI).
 */
export async function getUniversalTranslation(text: string): Promise<{ success: boolean; data?: TrilingualOutput; error?: string }> {
    if (!text || text.trim().length === 0) return { success: false, error: 'Empty text' };
    if (!project) return { success: false, error: 'Vertex AI project ID is not defined' };

    try {
        const vertexAI = new VertexAI({ project, location, googleAuthOptions: getAuthOptions() });
        const model = vertexAI.getGenerativeModel({
            model: 'gemini-2.5-flash-lite',
            generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.2
            }
        });

        const prompt = `
            CONTEXT: This is for the wedding app of Maria and Digvijay.
            STYLE GUIDELINES:
            - Tone: Joyful, welcoming, and premium.
            - Spanish (es): Elegant and warm ("cercano").
            - English (en): Modern and fluent.
            - Hindi (hi): Respectful and traditional. Use Devanagari script.
            - Terminology: Preserve Indian ritual names. Do NOT translate "Sangeet" (keep it as "Sangeet"). Respect names of locations in Valladolid.
            
            INPUT TEXT: "${text}"
            
            TASKS:
            1. Detect the source language.
            2. Translate the text into Spanish (es), English (en), and Hindi (hi).
            
            OUTPUT FORMAT:
            Return ONLY a JSON object:
            {
              "es": "Spanish translation",
              "en": "English translation",
              "hi": "Hindi translation"
            }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.candidates?.[0].content.parts[0].text;

        if (!responseText) throw new Error('AI returned an empty response');

        const cleanJson = responseText.replace(/```json|```/g, '').trim();
        const data = JSON.parse(cleanJson) as TrilingualOutput;

        return { success: true, data };
    } catch (error) {
        console.error('[Universal Translation Error]:', error);
        return { success: false, error: error instanceof Error ? error.message : 'AI translation failed' };
    }
}
