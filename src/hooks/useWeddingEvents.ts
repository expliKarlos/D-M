'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/services/firebase';
import type { TimelineEvent, TimelineEventFirestore } from '@/types/timeline';

/**
 * useWeddingEvents Hook (Solo Lectura - Senior Data Architect Edition)
 * 
 * Establece una conexión en tiempo real con la colección oficial 'timeline_events'.
 * Transforma los datos en un mapa organizado por fecha para una renderización eficiente.
 * 
 * @returns { 
 *   eventsByDate: Record<string, TimelineEvent[]>, 
 *   isLoading: boolean, 
 *   error: string | null 
 * }
 */
export function useWeddingEvents() {
    const [eventsByDate, setEventsByDate] = useState<Record<string, TimelineEvent[]>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Auditoría Senior: La colección 'timeline_events' es la fuente de verdad del Admin
        const eventsRef = collection(db, 'timeline_events');

        // Ordenamos por fullDate para garantizar la cronología antes de agrupar
        const q = query(eventsRef, orderBy('fullDate', 'asc'));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const grouped: Record<string, TimelineEvent[]> = {};
                const allEvents: TimelineEvent[] = [];

                snapshot.docs.forEach(doc => {
                    const data = doc.data() as TimelineEventFirestore;
                    const event: TimelineEvent = {
                        id: doc.id,
                        country: data.country,
                        title: data.title,
                        date: data.date,
                        time: data.time,
                        description: data.description,
                        location: data.location,
                        coordinates: data.coordinates,
                        image: data.image,
                        fullDate: data.fullDate.toDate(),
                        order: data.order,
                        createdAt: data.createdAt.toDate(),
                        updatedAt: data.updatedAt.toDate(),
                    };

                    allEvents.push(event);

                    // Agrupación por llave YYYY-MM-DD
                    const dateKey = event.fullDate.toISOString().split('T')[0];

                    if (!grouped[dateKey]) {
                        grouped[dateKey] = [];
                    }
                    grouped[dateKey].push(event);
                });

                // Protocolo de Verificación solicitado: Auditoría de Datos en Consola
                console.log('--- DATA AUDIT ---', allEvents);

                setEventsByDate(grouped);
                setIsLoading(false);
                setError(null);
            },
            (err) => {
                console.error('Error in useWeddingEvents Senior Hook:', err);
                setError('No se pudieron sincronizar los eventos oficiales.');
                setIsLoading(false);
            }
        );

        // Limpieza de suscripción para optimización de memoria
        return () => unsubscribe();
    }, []);

    // Interfaz estrictamente de lectura
    return { eventsByDate, isLoading, error };
}
