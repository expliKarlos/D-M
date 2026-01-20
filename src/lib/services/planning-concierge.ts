import { searchKnowledge } from './knowledge-base';
import { getWeddingConciergeInfo } from './vertex-ai';

export interface InfoCardData {
    id: string;
    category: string;
    title: string;
    content: string;
    priority: 'high' | 'medium' | 'low';
    icon: string;
}

export async function getInfoIndia(): Promise<InfoCardData[]> {
    const query = 'protocolo social india consejos mano derecha calzado regateo';
    const knowledgeDocs = await searchKnowledge(query);

    // Filter specifically for consejos.md if possible or just use relevant context
    const context = knowledgeDocs
        .filter(doc => doc.metadata.source_file?.includes('consejos'))
        .map(doc => doc.content)
        .join('\n\n');

    const prompt = `Extrae 4 micro-cápsulas informativas sobre el protocolo social en India, 
    enfocándote en: el uso de la mano derecha, el calzado en templos/casas, y el arte del regateo.`;

    return await getWeddingConciergeInfo(prompt, context || knowledgeDocs.map(d => d.content).join('\n\n'));
}

export async function getInfoUtil(): Promise<InfoCardData[]> {
    const queries = ['visado india 6 meses', 'vacunas india 4 semanas', 'seguros viaje contacto 24h', 'transportes india uber ola'];

    // Aggregate results for multiple critical topics
    const results = await Promise.all(queries.map(q => searchKnowledge(q)));
    const flatResults = results.flat();

    const context = flatResults.map(doc => doc.content).join('\n\n');

    const prompt = `Sintetiza la información crítica para el viaje:
    1. Visado: validez de 6 meses.
    2. Vacunas: planificación con 4-6 semanas de antelación.
    3. Seguros: contacto 24h.
    4. Transportes: uso de Uber y Ola.
    
    Genera micro-cápsulas informativas de alta prioridad (high priority) para estos puntos.`;

    return await getWeddingConciergeInfo(prompt, context);
}
