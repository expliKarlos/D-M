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
