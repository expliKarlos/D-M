'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/services/firebase';
import type { TimelineEvent, TimelineEventFirestore } from '@/types/timeline';

/**
 * useWeddingEvents Hook (SOLO LECTURA)
 * 
 * Este hook proporciona acceso en tiempo real a los eventos oficiales de la boda
 * desde la colección 'timeline_events'. Está diseñado siguiendo principios de 
 * Senior Fullstack para ser independiente, seguro y eficiente.
 * 
 * @returns { 
 *   events: TimelineEvent[], 
 *   isLoading: boolean, 
 *   error: string | null 
 * }
 */
export function useWeddingEvents() {
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // En base a la auditoría técnica, la colección principal es 'timeline_events'
        const eventsRef = collection(db, 'timeline_events');

        // Orden cronológico basado en el campo 'order' definido por el Admin
        // También podríamos usar 'fullDate' si se prefiere tiempo absoluto
        const q = query(eventsRef, orderBy('order', 'asc'));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const eventsData = snapshot.docs.map(doc => {
                    const data = doc.data() as TimelineEventFirestore;
                    return {
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
                    } as TimelineEvent;
                });

                setEvents(eventsData);
                setIsLoading(false);
                setError(null);
            },
            (err) => {
                console.error('Error in useWeddingEvents snapshot:', err);
                setError('No se pudieron cargar los eventos de la boda.');
                setIsLoading(false);
            }
        );

        // Limpieza de suscripción para evitar fugas de memoria
        return () => unsubscribe();
    }, []);

    // Solo exponemos datos y estados, sin funciones de mutación para mayor seguridad
    return { events, isLoading, error };
}
