'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { TimelineEvent, TimelineEventFirestore } from '@/types/timeline';

export interface MergedEvent extends Omit<TimelineEvent, 'country' | 'order' | 'image'> {
    isOfficial: boolean;
    country?: 'Valladolid' | 'India';
}

/**
 * useMergedAgenda Hook
 * 
 * Mezcla eventos oficiales (timeline_events) con planes personales (personal_itinerary).
 * Proporciona actualizaciones en tiempo real y una lista de fechas compartida.
 */
export function useMergedAgenda() {
    const [eventsByDate, setEventsByDate] = useState<Record<string, MergedEvent[]>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let unsubscribeOfficial = () => { };
        let unsubscribeUser = () => { };

        let officialEvents: MergedEvent[] = [];
        let userEvents: MergedEvent[] = [];

        const mergeAndGroup = () => {
            const allEvents = [...officialEvents, ...userEvents].sort((a, b) =>
                a.fullDate.getTime() - b.fullDate.getTime()
            );

            const grouped: Record<string, MergedEvent[]> = {};
            allEvents.forEach(event => {
                const dateKey = event.fullDate.toISOString().split('T')[0];
                if (!grouped[dateKey]) grouped[dateKey] = [];
                grouped[dateKey].push(event);
            });

            setEventsByDate(grouped);
        };

        // 1. Escuchar Eventos Oficiales
        const officialRef = collection(db, 'timeline_events');
        const qOfficial = query(officialRef, orderBy('fullDate', 'asc'));

        unsubscribeOfficial = onSnapshot(qOfficial, (snapshot) => {
            officialEvents = snapshot.docs.map(doc => {
                const data = doc.data() as TimelineEventFirestore;
                return {
                    id: doc.id,
                    title: data.title,
                    date: data.date,
                    time: data.time,
                    description: data.description,
                    location: data.location,
                    coordinates: data.coordinates,
                    fullDate: data.fullDate.toDate(),
                    createdAt: data.createdAt.toDate(),
                    updatedAt: data.updatedAt.toDate(),
                    isOfficial: true,
                    country: data.country
                };
            });
            mergeAndGroup();
            // Si el usuario no está autenticado, dejamos de cargar después de los oficiales
            if (!auth.currentUser) setIsLoading(false);
        }, (err) => {
            console.error('Error fetching official events:', err);
            setError('Error al cargar la agenda oficial');
        });

        // 2. Escuchar Itinerario Personal del Usuario
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            unsubscribeUser();
            if (user) {
                const personalRef = collection(db, 'users', user.uid, 'personal_itinerary');
                const qUser = query(personalRef, orderBy('fullDate', 'asc'));

                unsubscribeUser = onSnapshot(qUser, (snapshot) => {
                    userEvents = snapshot.docs.map(doc => {
                        const data = doc.data();
                        return {
                            id: doc.id,
                            title: data.title,
                            date: data.date || '',
                            time: data.time || '',
                            description: data.description || '',
                            location: data.location || '',
                            coordinates: data.coordinates,
                            fullDate: data.fullDate instanceof Timestamp ? data.fullDate.toDate() : new Date(data.fullDate),
                            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
                            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
                            isOfficial: false
                        };
                    });
                    mergeAndGroup();
                    setIsLoading(false);
                }, (err) => {
                    console.error('Error fetching personal itinerary:', err);
                    setIsLoading(false);
                });
            } else {
                userEvents = [];
                mergeAndGroup();
                setIsLoading(false);
            }
        });

        return () => {
            unsubscribeOfficial();
            unsubscribeUser();
            unsubscribeAuth();
        };
    }, []);

    return { eventsByDate, isLoading, error };
}
