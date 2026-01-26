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

/**
 * AI-Hybrid Action: Detects language and translates if needed with wedding context.
 */
export async function getSmartTranslation(text: string, targetLocale: string) {
    if (!project) return { success: false, error: 'Config error' };

    const vertexAI = new VertexAI({ project, location, googleAuthOptions: getAuthOptions() });
    const model = vertexAI.getGenerativeModel({
        model: 'gemini-2.5-flash-lite',
        generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
        Analyze this social message from a wedding wall: "${text}"
        1. Detect the source language.
        2. If the language is NOT "${targetLocale}", translate it to "${targetLocale}".
        3. Tone: Festive, warm, and emotional (Wedding context: Spanish/Indian).
        4. Return JSON: { "sourceLanguage": "...", "needsTranslation": boolean, "translation": "..." }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const resultText = response.candidates?.[0].content.parts[0].text;
        if (!resultText) throw new Error('Empty response');

        const cleanJson = resultText.replace(/```json|```/g, '').trim();
        return { success: true, ...JSON.parse(cleanJson) };
    } catch (error) {
        console.error('[Social AI Error]:', error);
        return { success: false, error: 'AI unavailable' };
    }
}

/**
 * Fast Language Detection
 */
export async function detectLanguage(text: string): Promise<{ success: boolean; language?: string; error?: string }> {
    if (!project) return { success: false, error: 'Config error' };

    const vertexAI = new VertexAI({ project, location, googleAuthOptions: getAuthOptions() });
    const model = vertexAI.getGenerativeModel({
        model: 'gemini-2.5-flash-lite',
    });

    const prompt = `Identify the language of this text: "${text}". Return ONLY the 2-letter ISO code (e.g., es, en, hi).`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const code = response.candidates?.[0].content.parts[0].text?.trim().toLowerCase();
        return { success: true, language: code };
    } catch (error) {
        return { success: false, error: 'Detection failed' };
    }
}
