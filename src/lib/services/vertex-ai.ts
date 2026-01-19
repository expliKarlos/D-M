import { VertexAI } from '@google-cloud/vertexai';
import { GoogleAuth } from 'google-auth-library';

const project = process.env.VERTEX_PROJECT_ID!;
const location = process.env.VERTEX_LOCATION || 'europe-west1';

// Helper to get GoogleAuthOptions with credentials if available
function getAuthOptions() {
    if (process.env.SERVICE_ACCOUNT_BASE64) {
        try {
            const json = Buffer.from(process.env.SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8');
            const credentials = JSON.parse(json);
            return { credentials };
        } catch (e) {
            console.error('CRITICAL: Failed to parse SERVICE_ACCOUNT_BASE64:', e);
            throw new Error(`Invalid SERVICE_ACCOUNT_BASE64: ${(e as Error).message}`);
        }
    }
    return undefined;
}


/**
 * Service to analyze logs using Google Vertex AI.
 * Uses gemini-2.5-flash-lite as the default model (assumed for 2026).
 */
export async function analyzeLogs(logs: string) {
    if (!project) throw new Error('VERTEX_PROJECT_ID is not defined');

    // Explicitly pass explicit project and location to avoid inference issues in Vercel
    const vertexAI = new VertexAI({
        project: project,
        location: location,
        googleAuthOptions: getAuthOptions()
    });

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
    if (!project) throw new Error('VERTEX_PROJECT_ID is not defined');

    const vertexAI = new VertexAI({
        project: project,
        location: location,
        googleAuthOptions: getAuthOptions()
    });
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

/**
 * Generates text embeddings using text-embedding-004 model.
 */
export async function getEmbedding(text: string): Promise<number[]> {
    try {
        // Use REST API via GoogleAuth to avoid SDK issues with embedContent
        let credentials;
        if (process.env.SERVICE_ACCOUNT_BASE64) {
            try {
                const json = Buffer.from(process.env.SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8');
                credentials = JSON.parse(json);
            } catch (e) {
                console.warn('Failed to parse SERVICE_ACCOUNT_BASE64:', e);
            }
        }

        const auth = new GoogleAuth({
            scopes: 'https://www.googleapis.com/auth/cloud-platform',
            credentials
        });

        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();
        const token = accessToken.token;

        if (!token) throw new Error('Failed to get access token');

        const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/text-embedding-004:predict`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                instances: [{ content: text }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Vertex AI API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result = (await response.json()) as any;
        const embedding = result.predictions?.[0]?.embeddings?.values;

        if (!embedding) {
            throw new Error('No embedding returned from Vertex AI API');
        }

        return embedding;
    } catch (error) {
        console.error('[Vertex AI Embedding Error]:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        throw error;
    }
}

/**
 * Service to stream chat with the D&M Concierge.
 */
export async function streamChatWithConcierge(
    userMessage: string,
    systemContext: string = '',
    history: { role: 'user' | 'model'; parts: string }[] = []
) {
    if (!project) throw new Error('VERTEX_PROJECT_ID is not defined');

    const vertexAI = new VertexAI({
        project: project,
        location: location,
        googleAuthOptions: getAuthOptions()
    });
    const model = vertexAI.getGenerativeModel({
        model: 'gemini-2.5-flash-lite',
        systemInstruction: {
            role: 'system',
            parts: [{
                text: `Actúas como 'D&M Concierge', un asistente experto en la boda de Digvijay y María.

Contexto de Conocimiento (RAG):
${systemContext}

Contexto Bicultural: Conoces a fondo las tradiciones españolas e indias.
Idiomas: Responde siempre en el idioma en el que te hablen (ES, EN, HI).
Seguridad: Usa SOLO la información proporcionada en el Contexto de Conocimiento. Si no está ahí, di que no lo sabes y sugiere contactar a los novios.
Si el contexto incluye 'media_urls', finaliza tu respuesta indicando: 'He preparado unas infografías detalladas para ayudarte, puedes verlas a continuación'.
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
        const result = await chat.sendMessageStream(userMessage);
        return result.stream;
    } catch (error) {
        console.error('[Vertex AI Stream Error]:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        throw error;
    }
}
