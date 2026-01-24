import { VertexAI } from '@google-cloud/vertexai';
import { GoogleAuth } from 'google-auth-library';

const project = (process.env.VERTEX_PROJECT_ID || '').trim();
const location = (process.env.VERTEX_LOCATION || 'europe-west1').trim();



// Helper to get GoogleAuthOptions with credentials if available
function getAuthOptions() {
    if (process.env.SERVICE_ACCOUNT_BASE64) {
        try {
            const json = Buffer.from(process.env.SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8');
            const credentials = JSON.parse(json);

            // Deep Validation
            const envProject = process.env.VERTEX_PROJECT_ID?.trim();
            const jsonProject = credentials.project_id;

            if (envProject && jsonProject && envProject !== jsonProject) {
                console.error(`[Auth Critical] Project ID Mismatch! Env: '${envProject}' vs JSON: '${jsonProject}'`);
                throw new Error(`Project ID Mismatch: Env var is '${envProject}' but JSON credential is for '${jsonProject}'. They must match.`);
            }

            if (!credentials.private_key || !credentials.private_key.includes('BEGIN PRIVATE KEY')) {
                throw new Error('Invalid Private Key in JSON credential');
            }

            console.log(`[Auth Success] Loaded credentials for ${credentials.client_email} in project ${jsonProject}`);

            return { credentials };
        } catch (e) {
            console.error('CRITICAL: Failed to parse SERVICE_ACCOUNT_BASE64:', e);
            throw new Error(`Auth Config Error: ${(e as Error).message}`);
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

Contexto Bicultural: Conoces a fondo las tradiciones españolas e indias.
Idiomas: Responde siempre en el idioma en el que te hablen (ES, EN, HI).
Seguridad: Si no tienes la información en tu base de datos, dirige al usuario a contactar con los novios o el Wedding Planner.

INTEGRACIÓN CON CÁMARA: 
Si el usuario envía un mensaje que comienza con "He traducido este texto:", actúa como un experto local:
1. Si detectas que el texto es un menú o plato de comida, advierte sobre el nivel de picante y posibles alérgenos comunes.
2. Si es una señal de tráfico o indicación, explica cómo afecta al transporte de los invitados.
3. Si es un folleto turístico, añade un "dato curioso" adicional.

FORMATO: Mantén las respuestas BREVES y útiles para lectura rápida en el móvil.

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
        // Use standard GoogleAuth which will now pick up credentials from getAuthOptions
        const authOptions = getAuthOptions();

        const auth = new GoogleAuth({
            scopes: 'https://www.googleapis.com/auth/cloud-platform',
            credentials: authOptions?.credentials
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

INTEGRACIÓN CON CÁMARA: 
Si el usuario envía un mensaje que comienza con "He traducido este texto:", actúa como un experto local:
1. Si detectas que el texto es un menú o plato de comida, advierte sobre el nivel de picante (especialmente en India) y posibles alérgenos comunes.
2. Si es una señal de tráfico o indicación, explica cómo afecta al transporte de los invitados.
3. Si es un folleto turístico, añade un "dato curioso" que no esté en el texto.

FORMATO: Mantén las respuestas BREVES y estructuradas (2-3 párrafos máx) para una lectura rápida en el móvil.

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

/**
 * Specialized service for structured information extraction as 'Wedding Concierge'.
 */
export async function getWeddingConciergeInfo(prompt: string, context: string) {
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
                text: `Actúas como 'Wedding Concierge' para la boda de Digvijay y María. 
                Tu objetivo es extraer información CRÍTICA y síntesis útil de los documentos proporcionados.
                
                REGLAS DE SALIDA:
                1. Devuelve SIEMPRE un JSON puro (sin markdown blocks).
                2. El formato debe ser un array de objetos: { "id": string, "category": string, "title": string, "content": string, "priority": "high" | "medium" | "low", "icon": string }.
                3. Las 'micro-cápsulas' deben ser cortas, directas y fáciles de leer en móvil.
                4. Idioma: Español.
                
                CONTEXTO:
                ${context}`
            }]
        },
        generationConfig: {
            responseMimeType: 'application/json',
        }
    });

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.candidates?.[0].content.parts[0].text;
        if (!text) throw new Error('Empty response from model');
        return JSON.parse(text);
    } catch (error) {
        console.error('[Vertex AI Extraction Error]:', error);
        throw error;
    }
}
/**
 * Validates if an image is appropriate, sharp, and wedding-themed using Gemini Vision.
 */
export async function validateWeddingImage(imageUrl: string) {
    if (!project) throw new Error('VERTEX_PROJECT_ID is not defined');

    const vertexAI = new VertexAI({
        project: project,
        location: location,
        googleAuthOptions: getAuthOptions()
    });

    const model = vertexAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp', // Using 2.0 Flash for vision tasks (2026 standard)
    });

    const prompt = `
    Analiza esta imagen y determina si es apta para publicarse en el muro social de una boda.
    
    Criterios de validación:
    1. Contenido: Debe ser apropiado (nada de violencia, desnudez o contenido ofensivo).
    2. Calidad: No debe estar extremadamente borrosa o subexpuesta (demasiado oscura).
    3. Temática: Debe ser algo relacionado con una celebración, boda, fiesta, invitados, comida o decoración.

    RESPONDE ÚNICAMENTE CON UN JSON EN ESTE FORMATO:
    {
      "valid": boolean,
      "reason": "breve explicación en español si valid es false, o un mensaje de éxito si es true"
    }
  `;

    try {
        // 1. Fetch and convert image to base64
        const imageResponse = await fetch(imageUrl);
        const imageBuffer = await imageResponse.arrayBuffer();
        const base64Image = Buffer.from(imageBuffer).toString('base64');
        const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

        // 2. Generate content using the proper Vertex AI SDK format
        const visionResult = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [
                    {
                        inlineData: {
                            data: base64Image,
                            mimeType: mimeType
                        }
                    },
                    { text: prompt }
                ]
            }],
            generationConfig: {
                responseMimeType: 'application/json',
            }
        });

        const response = await visionResult.response;
        const text = response.candidates?.[0].content.parts[0].text;
        if (!text) throw new Error('Empty response from vision model');

        // Ensure clean JSON (Gemini sometimes adds markdown blocks)
        const cleanJson = text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanJson) as { valid: boolean; reason: string };
    } catch (error) {
        console.error('[Vertex AI Vision Error]:', error);
        throw error;
    }
}
/**
 * Service to translate text into multiple languages for the wedding guests.
 */
export async function translateText(text: string) {
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
                text: `Actúas como un traductor experto bicultural para la boda de Digvijay y María. 
                Tu objetivo es traducir texto del español al inglés, hindi y punjabi.
                
                REGLAS DE SALIDA:
                1. Devuelve SIEMPRE un JSON puro (sin markdown blocks).
                2. Formato: { "en": "translation", "hi": "translation", "pa": "translation" }.
                3. Usa un tono natural y apropiado para una boda o viaje.`
            }]
        },
        generationConfig: {
            responseMimeType: 'application/json',
        }
    });

    try {
        const result = await model.generateContent(text);
        const response = await result.response;
        const resultText = response.candidates?.[0].content.parts[0].text;
        if (!resultText) throw new Error('Empty response from model');

        // Clean JSON
        const cleanJson = resultText.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error('[Vertex AI Translation Error]:', error);
        throw error;
    }
}

/**
 * Service to analyze an image, detect text in English or Hindi, and translate it to Spanish.
 */
export async function translateImageText(base64Image: string, mimeType: string) {
    if (!project) throw new Error('VERTEX_PROJECT_ID is not defined');

    const vertexAI = new VertexAI({
        project: project,
        location: location,
        googleAuthOptions: getAuthOptions()
    });

    const model = vertexAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp', // Best for vision + reasoning (2026)
    });

    const prompt = `
    Analiza esta imagen. Detecta cualquier texto en inglés o hindi. 
    Tradúcelo íntegramente al español de forma estructurada y clara. 
    Si es un menú o una señal, intenta mantener el formato original o describe la estructura de forma lógica.
    
    SI NO ENCUENTRAS TEXTO LEGIBLE, RESPONDE EXACTAMENTE CON: "No he podido encontrar texto claro, ¿puedes intentar acercar más la cámara?"
    
    Responde solo con la traducción en español o el mensaje de error.
    `;

    try {
        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [
                    {
                        inlineData: {
                            data: base64Image,
                            mimeType: mimeType
                        }
                    },
                    { text: prompt }
                ]
            }]
        });

        const response = await result.response;
        const text = response.candidates?.[0].content.parts[0].text;
        if (!text) throw new Error('No se detectó texto o la IA no devolvió respuesta');
        return text;
    } catch (error) {
        console.error('[Vertex AI Camera Translate Error]:', error);
        throw error;
    }
}
