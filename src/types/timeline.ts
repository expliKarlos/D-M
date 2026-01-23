import { Timestamp } from 'firebase/firestore';

export interface TimelineEvent {
    id: string;
    country: 'Valladolid' | 'India';
    title: string;
    date: string; // "12 de Junio, 2026"
    time: string; // "18:00"
    description: string;
    location: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    image: string; // URL from Supabase Storage
    fullDate: Date; // For sorting and countdown
    order: number; // For drag & drop reordering
    createdAt: Date;
    updatedAt: Date;
}

export interface TimelineEventFormData {
    country: 'Valladolid' | 'India';
    title: string;
    date: string;
    time: string;
    description: string;
    location: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    image?: File | string; // File for upload or URL if already uploaded
}

export interface TimelineEventFirestore {
    country: 'Valladolid' | 'India';
    title: string;
    date: string;
    time: string;
    description: string;
    location: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    image: string;
    fullDate: Timestamp;
    order: number;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}
