'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { db } from '@/lib/services/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export interface GalleryImage {
    id: string;
    url: string;
    url_optimized?: string;
    timestamp: number;
    category?: string;
    likes_count: number;
    liked_by: string[];
}

export interface Moment {
    id: string;
    name: string;
    icon: string;
    order: number;
}

interface GalleryContextType {
    images: GalleryImage[];
    moments: Moment[];
    isLoading: boolean;
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

export function GalleryProvider({ children }: { children: React.ReactNode }) {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [moments, setMoments] = useState<Moment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 1. Listen for moments
        const mq = query(collection(db, 'moments'), orderBy('order', 'asc'));
        const unsubscribeMoments = onSnapshot(mq, (sn) => {
            setMoments(sn.docs.map(d => ({ id: d.id, ...d.data() } as Moment)));
        });

        // 2. Listen for photos
        const pq = query(collection(db, 'photos'), orderBy('timestamp', 'desc'));
        const unsubscribePhotos = onSnapshot(pq, (snapshot) => {
            const galleryImages: GalleryImage[] = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    url: data.url || data.content || data.imageUrl,
                    url_optimized: data.url_optimized || data.thumbnail || data.url || data.imageUrl,
                    timestamp: data.timestamp,
                    category: data.moment || 'ceremonia',
                    likes_count: data.likesCount || 0,
                    liked_by: data.liked_by || [],
                };
            });
            setImages(galleryImages);
            setIsLoading(false);
        }, (error) => {
            console.error('Error fetching images:', error);
            setIsLoading(false);
        });

        return () => {
            unsubscribeMoments();
            unsubscribePhotos();
        };
    }, []);

    const value = useMemo(() => ({
        images,
        moments,
        isLoading
    }), [images, moments, isLoading]);

    return (
        <GalleryContext.Provider value={value}>
            {children}
        </GalleryContext.Provider>
    );
}

export function useGallery() {
    const context = useContext(GalleryContext);
    if (context === undefined) {
        throw new Error('useGallery must be used within a GalleryProvider');
    }
    return context;
}
