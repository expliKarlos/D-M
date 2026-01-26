'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/services/firebase';
import type { TimelineEvent, TimelineEventFirestore } from '@/types/timeline';

interface TimelineContextType {
    events: TimelineEvent[];
    isLoading: boolean;
    error: string | null;
}

const TimelineContext = createContext<TimelineContextType | undefined>(undefined);

function firestoreToEvent(id: string, data: TimelineEventFirestore): TimelineEvent {
    return {
        id,
        country: data.country,
        title: data.title,
        title_es: data.title_es,
        title_en: data.title_en,
        title_hi: data.title_hi,
        date: data.date,
        time: data.time,
        description: data.description,
        description_es: data.description_es,
        description_en: data.description_en,
        description_hi: data.description_hi,
        location: data.location,
        coordinates: data.coordinates,
        image: data.image,
        fullDate: data.fullDate.toDate(),
        order: data.order,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
    };
}

export function TimelineProvider({ children }: { children: React.ReactNode }) {
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const eventsRef = collection(db, 'timeline_events');
        const q = query(eventsRef, orderBy('order', 'asc'));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const eventsData = snapshot.docs.map(doc =>
                    firestoreToEvent(doc.id, doc.data() as TimelineEventFirestore)
                );
                setEvents(eventsData);
                setIsLoading(false);
                setError(null);
            },
            (err) => {
                console.error('Error fetching timeline events:', err);
                setError('Failed to load timeline events');
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    return (
        <TimelineContext.Provider value={{ events, isLoading, error }}>
            {children}
        </TimelineContext.Provider>
    );
}

export function useTimeline() {
    const context = useContext(TimelineContext);
    if (context === undefined) {
        throw new Error('useTimeline must be used within a TimelineProvider');
    }
    return context;
}
