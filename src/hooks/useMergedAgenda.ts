'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { TimelineEvent, TimelineEventFirestore } from '@/types/timeline';

export interface MergedEvent extends Omit<TimelineEvent, 'country' | 'order' | 'image'> {
    isOfficial: boolean;
    country?: 'Valladolid' | 'India';
    title_en?: string;
    title_hi?: string;
    description_en?: string;
    description_hi?: string;
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

    // Helper para parsear fechas de forma ultra-resiliente
    const safeToDate = (val: any, fallbackStr?: string, fallbackTime?: string): Date => {
        if (!val) {
            // Si no hay fullDate, intentamos parsear de los strings date/time
            if (fallbackStr && fallbackTime) {
                // Formato esperado: "12 de Junio, 2026"
                const parts = fallbackStr.toLowerCase().split(' de ');
                if (parts.length >= 2) {
                    const day = parseInt(parts[0]);
                    const monthYear = parts[1].split(', ');
                    const year = parseInt(monthYear[1]);
                    const spanishMonths: Record<string, number> = {
                        'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
                        'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
                    };
                    const monthIndex = spanishMonths[monthYear[0].trim()];
                    if (monthIndex !== undefined && !isNaN(day)) {
                        const [h, m] = fallbackTime.split(':').map(Number);
                        return new Date(year, monthIndex, day, h || 0, m || 0);
                    }
                }
            }
            return new Date();
        }
        if (val instanceof Date) return val;
        if (typeof val.toDate === 'function') return val.toDate();
        if (typeof val.seconds === 'number') return new Date(val.seconds * 1000);
        const parsed = new Date(val);
        return isNaN(parsed.getTime()) ? new Date() : parsed;
    };

    const getLocalDateKey = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    useEffect(() => {
        let unsubscribeOfficial = () => { };
        let unsubscribeUser = () => { };

        let officialEvents: MergedEvent[] = [];
        let userEvents: MergedEvent[] = [];

        const mergeAndGroup = () => {
            const allEvents = [...officialEvents, ...userEvents].sort((a, b) =>
                a.fullDate.getTime() - b.fullDate.getTime()
            );

            console.log('--- AGENDA MERGE AUDIT ---', {
                officialCount: officialEvents.length,
                userCount: userEvents.length,
                total: allEvents.length
            });

            const grouped: Record<string, MergedEvent[]> = {};
            allEvents.forEach(event => {
                const dateKey = getLocalDateKey(event.fullDate);
                if (!grouped[dateKey]) grouped[dateKey] = [];
                grouped[dateKey].push(event);
            });

            setEventsByDate(grouped);
        };

        // 1. Escuchar Eventos Oficiales
        const officialRef = collection(db, 'timeline_events');
        // Usamos la colección directamente para evitar excluir documentos sin el campo fullDate
        unsubscribeOfficial = onSnapshot(officialRef, (snapshot) => {
            console.log(`--- [DEBUG] Agenda Oficial: Fetch de ${snapshot.size} documentos ---`);
            officialEvents = snapshot.docs.map(doc => {
                const data = doc.data();
                const fDate = safeToDate(data.fullDate, data.date, data.time);

                return {
                    id: doc.id,
                    title: data.title,
                    date: data.date,
                    time: data.time,
                    description: data.description,
                    location: data.location,
                    coordinates: data.coordinates,
                    fullDate: fDate,
                    createdAt: safeToDate(data.createdAt),
                    updatedAt: safeToDate(data.updatedAt),
                    isOfficial: true,
                    country: data.country,
                    title_en: data.title_en,
                    title_hi: data.title_hi,
                    description_en: data.description_en,
                    description_hi: data.description_hi
                };
            });
            mergeAndGroup();
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
                // Más inclusivo también para itinerario personal
                unsubscribeUser = onSnapshot(personalRef, (snapshot) => {
                    console.log(`--- [DEBUG] Agenda Personal: Fetch de ${snapshot.size} documentos ---`);
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
                            fullDate: safeToDate(data.fullDate, data.date, data.time),
                            createdAt: safeToDate(data.createdAt),
                            updatedAt: safeToDate(data.updatedAt),
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
