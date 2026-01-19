import { VertexAI } from '@google-cloud/vertexai';

const project = process.env.VERTEX_PROJECT_ID!;
const location = process.env.VERTEX_LOCATION || 'europe-west1';

/**
 * Service to analyze logs using Google Vertex AI.
 * Uses gemini-2.5-flash-lite as the default model (assumed for 2026).
 */
export async function analyzeLogs(logs: string) {
    const vertexAI = new VertexAI({ project, location });
    const model = vertexAI.getGenerativeModel({
        model: 'gemini-2.5-flash-lite',
    });

    const prompt = `
    Analiza los siguientes logs del sistema y detecta anomalías, errores críticos o cuellos de botella.
    Proporciona un resumen ejecutivo en español.

    LOGS:
    ${logs}
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.candidates?.[0].content.parts[0].text;
    } catch (error) {
        // Explicitly log for Vercel runtime logs
        console.error('[Vertex AI Error]:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        throw error;
    }
}

/**
 * Service to chat with the D&M Concierge.
 * Implements the specific persona and safety rules.
 */
export async function chatWithConcierge(userMessage: string, history: { role: 'user' | 'model'; parts: string }[] = []) {
    const vertexAI = new VertexAI({ project, location });
    const model = vertexAI.getGenerativeModel({
        model: 'gemini-2.5-flash-lite',
        systemInstruction: {
            role: 'system',
            parts: [{
                text: `Actúas como 'D&M Concierge', un asistente experto en la boda de Digvijay y María.

Contexto Bicultural: Conoces a fondo las tradiciones españolas e indias. Sabes explicar qué es un 'Sangeet' a un español y qué es el 'Protocolo de Tapas' a un indio.

Idiomas: Responde siempre en el idioma en el que te hablen (ES, EN, HI).

Seguridad: No inventes horarios. Si no tienes la información en tu base de datos, dirige al usuario a contactar con los novios o el Wedding Planner.

Tono: Amistoso, elegante, entusiasta y servicial.`
            }]
        }
    });

    const chat = model.startChat({
        history: history.map(h => ({
            role: h.role,
            parts: [{ text: h.parts }]
        })),
        generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7,
        }
    });

    try {
        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        return response.candidates?.[0].content.parts[0].text;
    } catch (error) {
        console.error('[Vertex AI Chat Error]:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        throw error;
    }
}
