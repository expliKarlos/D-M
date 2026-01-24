'use server';

import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/services/firebase-admin';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getTimelineDb() {
    const db = adminDb();
    if (!db) {
        throw new Error('Firebase Admin not initialized');
    }
    return db;
}

const SPANISH_MONTHS: Record<string, number> = {
    'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
    'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
};

function parseSpanishDate(dateStr: string, timeStr: string): Date | null {
    try {
        // "12 de Junio, 2026"
        const parts = dateStr.toLowerCase().split(' de ');
        if (parts.length < 2) return null;

        const day = parseInt(parts[0]);
        const monthYear = parts[1].split(', ');
        if (monthYear.length < 2) return null;

        const monthName = monthYear[0].trim();
        const year = parseInt(monthYear[1]);
        const monthIndex = SPANISH_MONTHS[monthName];

        if (monthIndex === undefined || isNaN(day) || isNaN(year)) return null;

        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date(year, monthIndex, day, hours || 0, minutes || 0);

        return isNaN(date.getTime()) ? null : date;
    } catch (error) {
        console.error('Error parsing Spanish date:', error);
        return null;
    }
}

async function getTimelineEventData(id: string) {
    const db = getTimelineDb();
    const snapshot = await db.collection('timeline_events').doc(id).get();
    if (!snapshot.exists) return null;
    return { id: snapshot.id, ...snapshot.data() } as any; // Cast to avoid lint errors in usage
}

/**
 * Upload timeline image to Supabase Storage
 */
export async function uploadTimelineImage(formData: FormData): Promise<{ url: string } | { error: string }> {
    try {
        console.log('[uploadTimelineImage] Starting upload process...');

        const file = formData.get('file') as File;
        if (!file) {
            console.error('[uploadTimelineImage] No file provided');
            return { error: 'No file provided' };
        }

        console.log('[uploadTimelineImage] File received:', {
            name: file.name,
            type: file.type,
            size: file.size
        });

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            console.error('[uploadTimelineImage] Invalid file type:', file.type);
            return { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' };
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            console.error('[uploadTimelineImage] File too large:', file.size);
            return { error: 'File too large. Maximum size is 5MB.' };
        }

        console.log('[uploadTimelineImage] Validations passed, creating Supabase client...');

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('[uploadTimelineImage] Missing Supabase credentials');
            return { error: 'Server configuration error: Missing Supabase credentials' };
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        console.log('[uploadTimelineImage] Supabase client created');

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const extension = file.name.split('.').pop();
        const filename = `timeline-${timestamp}-${randomString}.${extension}`;

        console.log('[uploadTimelineImage] Generated filename:', filename);
        console.log('[uploadTimelineImage] Starting upload to Supabase Storage...');

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('timeline-images')
            .upload(filename, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('[uploadTimelineImage] Supabase upload error:', error);
            return { error: `Failed to upload image: ${error.message}` };
        }

        console.log('[uploadTimelineImage] Upload successful, getting public URL...');

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('timeline-images')
            .getPublicUrl(data.path);

        console.log('[uploadTimelineImage] Public URL obtained:', publicUrl);

        return { url: publicUrl };
    } catch (error) {
        console.error('[uploadTimelineImage] Unexpected error:', error);
        return { error: `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
}

/**
 * Delete timeline image from Supabase Storage
 */
async function deleteTimelineImage(imageUrl: string): Promise<void> {
    try {
        // Extract filename from URL
        const url = new URL(imageUrl);
        const pathParts = url.pathname.split('/');
        const filename = pathParts[pathParts.length - 1];

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        await supabase.storage
            .from('timeline-images')
            .remove([filename]);
    } catch (error) {
        console.error('Error deleting timeline image:', error);
        // Don't throw - image deletion is not critical
    }
}

/**
 * Create a new timeline event
 */
export async function createEvent(formData: FormData): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
        const country = formData.get('country') as 'Valladolid' | 'India';
        const title = formData.get('title') as string;
        const date = formData.get('date') as string;
        const time = formData.get('time') as string;
        const description = formData.get('description') as string;
        const location = formData.get('location') as string;
        const lat = parseFloat(formData.get('lat') as string);
        const lng = parseFloat(formData.get('lng') as string);
        const imageUrl = formData.get('imageUrl') as string;
        const order = parseInt(formData.get('order') as string) || 0;

        // Validation
        if (!country || !title || !date || !time || !description || !location || !imageUrl) {
            return { success: false, error: 'All fields are required' };
        }

        if (isNaN(lat) || isNaN(lng)) {
            return { success: false, error: 'Invalid coordinates' };
        }

        // Parse fullDate from date and time
        const fullDate = parseSpanishDate(date, time);
        if (!fullDate) {
            return { success: false, error: 'Formato de fecha u hora inválido. Usa: "12 de Junio, 2026" y "18:00"' };
        }

        const db = getTimelineDb();
        const now = new Date();
        const docRef = await db.collection('timeline_events').add({
            country,
            title,
            date,
            time,
            description,
            location,
            coordinates: { lat, lng },
            image: imageUrl,
            fullDate,
            order,
            createdAt: now,
            updatedAt: now,
        });

        revalidatePath('/[lang]/(protected)/enlace', 'page');
        revalidatePath('/[lang]/(admin)/admin/timeline', 'page');

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating timeline event:', error);
        return { success: false, error: 'Failed to create event' };
    }
}

/**
 * Update an existing timeline event
 */
export async function updateEvent(id: string, formData: FormData): Promise<{ success: boolean; error?: string }> {
    try {
        const country = formData.get('country') as 'Valladolid' | 'India';
        const title = formData.get('title') as string;
        const date = formData.get('date') as string;
        const time = formData.get('time') as string;
        const description = formData.get('description') as string;
        const location = formData.get('location') as string;
        const lat = parseFloat(formData.get('lat') as string);
        const lng = parseFloat(formData.get('lng') as string);
        const imageUrl = formData.get('imageUrl') as string;

        // Validation
        if (!country || !title || !date || !time || !description || !location || !imageUrl) {
            return { success: false, error: 'All fields are required' };
        }

        if (isNaN(lat) || isNaN(lng)) {
            return { success: false, error: 'Invalid coordinates' };
        }

        // Parse fullDate from date and time
        const fullDate = parseSpanishDate(date, time);
        if (!fullDate) {
            return { success: false, error: 'Formato de fecha u hora inválido. Usa: "12 de Junio, 2026" y "18:00"' };
        }

        const db = getTimelineDb();
        await db.collection('timeline_events').doc(id).update({
            country,
            title,
            date,
            time,
            description,
            location,
            coordinates: { lat, lng },
            image: imageUrl,
            fullDate,
            updatedAt: new Date(),
        });

        revalidatePath('/[lang]/(protected)/enlace', 'page');
        revalidatePath('/[lang]/(admin)/admin/timeline', 'page');

        return { success: true };
    } catch (error) {
        console.error('Error updating timeline event:', error);
        return { success: false, error: 'Failed to update event' };
    }
}

/**
 * Delete a timeline event
 */
export async function deleteEvent(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        // Get event to retrieve image URL for cleanup
        const event = await getTimelineEventData(id);

        if (event && event.image) {
            // Delete image from Supabase Storage
            await deleteTimelineImage(event.image as string);
        }

        const db = getTimelineDb();
        await db.collection('timeline_events').doc(id).delete();

        revalidatePath('/[lang]/(protected)/enlace', 'page');
        revalidatePath('/[lang]/(admin)/admin/timeline', 'page');

        return { success: true };
    } catch (error) {
        console.error('Error deleting timeline event:', error);
        return { success: false, error: 'Failed to delete event' };
    }
}

/**
 * Reorder timeline events
 */
export async function reorderEvents(eventIds: string[]): Promise<{ success: boolean; error?: string }> {
    try {
        const db = getTimelineDb();
        const batch = db.batch();

        eventIds.forEach((id, index) => {
            const ref = db.collection('timeline_events').doc(id);
            batch.update(ref, { order: index, updatedAt: new Date() });
        });

        await batch.commit();

        revalidatePath('/[lang]/(protected)/enlace', 'page');
        revalidatePath('/[lang]/(admin)/admin/timeline', 'page');

        return { success: true };
    } catch (error) {
        console.error('Error reordering timeline events:', error);
        return { success: false, error: 'Failed to reorder events' };
    }
}

/**
 * Duplicate a timeline event
 */
export async function duplicateEvent(id: string): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
        const event = await getTimelineEventData(id);

        if (!event) {
            return { success: false, error: 'Event not found' };
        }

        const db = getTimelineDb();
        const eventData = { ...event } as Record<string, any>;
        delete eventData.id;
        delete eventData.createdAt;
        delete eventData.updatedAt;

        const order = typeof eventData.order === 'number' ? eventData.order + 1 : 1;
        const now = new Date();

        // Create new event with same data but incremented order
        const docRef = await db.collection('timeline_events').add({
            ...eventData,
            title: `${eventData.title || 'Evento'} (Copia)`,
            order,
            createdAt: now,
            updatedAt: now,
        });

        revalidatePath('/[lang]/(protected)/enlace', 'page');
        revalidatePath('/[lang]/(admin)/admin/timeline', 'page');

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error duplicating timeline event:', error);
        return { success: false, error: 'Failed to duplicate event' };
    }
}
