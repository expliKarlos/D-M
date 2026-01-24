'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { TimelineEvent, TimelineEventFirestore } from '@/types/timeline';

export interface AgendaEvent extends Omit<TimelineEvent, 'country' | 'order' | 'image'> {
    isOfficial: boolean;
    category?: string;
}

/**
 * useAgendaData Hook
 * 
 * Fusiona eventos oficiales (timeline_events) con planes personales (user_itinerary).
 * Devuelve los eventos agrupados por fecha.
 */
export function useAgendaData() {
    const [eventsByDate, setEventsByDate] = useState<Record<string, AgendaEvent[]>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let unsubscribeOfficial = () => { };
        let unsubscribeUser = () => { };

        let officialEvents: AgendaEvent[] = [];
        let userEvents: AgendaEvent[] = [];

        const mergeAndGroup = () => {
            const allEvents = [...officialEvents, ...userEvents].sort((a, b) =>
                a.fullDate.getTime() - b.fullDate.getTime()
            );

            const grouped: Record<string, AgendaEvent[]> = {};
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
                    category: data.country === 'Valladolid' ? 'Oficial ES' : 'Oficial IN'
                };
            });
            mergeAndGroup();
            if (!auth.currentUser) setIsLoading(false);
        }, (err) => {
            console.error('Error fetching official events:', err);
            setError('Error al cargar eventos oficiales');
        });

        // 2. Escuchar Itinerario del Usuario
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            unsubscribeUser();
            if (user) {
                const userRef = collection(db, 'users', user.uid, 'personal_agenda');
                const qUser = query(userRef, orderBy('fullDate', 'asc'));

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
                            isOfficial: false,
                            category: data.category || 'Personal'
                        };
                    });
                    mergeAndGroup();
                    setIsLoading(false);
                }, (err) => {
                    console.error('Error fetching user itinerary:', err);
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
