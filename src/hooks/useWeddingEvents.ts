'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/services/firebase';
import type { TimelineEvent, TimelineEventFirestore } from '@/types/timeline';

/**
 * useWeddingEvents Hook (Solo Lectura)
 * 
 * Este hook se conecta a la colección 'timeline_events' y devuelve los eventos
 * de la boda organizados por fecha. Ideal para renderizar itinerarios o agendas.
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
        const eventsRef = collection(db, 'timeline_events');
        // Ordenamos por fullDate para que el agrupamiento sea cronológico por defecto
        const q = query(eventsRef, orderBy('fullDate', 'asc'));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const grouped: Record<string, TimelineEvent[]> = {};

                snapshot.docs.forEach(doc => {
                    const data = doc.data() as TimelineEventFirestore;
                    // Transformamos los Timestamps de Firestore a Dates nativas de JS
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

                    // Agrupamos usando como llave la fecha en formato YYYY-MM-DD
                    const dateKey = event.fullDate.toISOString().split('T')[0];

                    if (!grouped[dateKey]) {
                        grouped[dateKey] = [];
                    }
                    grouped[dateKey].push(event);
                });

                setEventsByDate(grouped);
                setIsLoading(false);
                setError(null);
            },
            (err) => {
                console.error('Error fetching wedding events in hook:', err);
                setError('No se pudieron cargar los eventos de la boda.');
                setIsLoading(false);
            }
        );

        // Limpiamos el listener al desmontar el componente
        return () => unsubscribe();
    }, []);

    return { eventsByDate, isLoading, error };
}
