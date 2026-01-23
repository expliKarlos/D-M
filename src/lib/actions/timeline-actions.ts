'use server';

import { revalidatePath } from 'next/cache';
import {
    createTimelineEvent,
    updateTimelineEvent,
    deleteTimelineEvent,
    reorderTimelineEvents,
    getTimelineEvent
} from '@/lib/services/firebase-timeline';
import { createClient } from '@supabase/supabase-js';
import type { TimelineEventFormData } from '@/types/timeline';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Upload timeline image to Supabase Storage
 */
export async function uploadTimelineImage(formData: FormData): Promise<{ url: string } | { error: string }> {
    try {
        const file = formData.get('file') as File;
        if (!file) {
            return { error: 'No file provided' };
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            return { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' };
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return { error: 'File too large. Maximum size is 5MB.' };
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const extension = file.name.split('.').pop();
        const filename = `timeline-${timestamp}-${randomString}.${extension}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('timeline-images')
            .upload(filename, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Supabase upload error:', error);
            return { error: 'Failed to upload image' };
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('timeline-images')
            .getPublicUrl(data.path);

        return { url: publicUrl };
    } catch (error) {
        console.error('Error uploading timeline image:', error);
        return { error: 'Failed to upload image' };
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
        const fullDate = new Date(`${date.split(' de ').reverse().join('-')} ${time}`);
        if (isNaN(fullDate.getTime())) {
            return { success: false, error: 'Invalid date or time format' };
        }

        const id = await createTimelineEvent({
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
        });

        revalidatePath('/[lang]/(protected)/enlace', 'page');
        revalidatePath('/[lang]/(admin)/admin/timeline', 'page');

        return { success: true, id };
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
        const fullDate = new Date(`${date.split(' de ').reverse().join('-')} ${time}`);
        if (isNaN(fullDate.getTime())) {
            return { success: false, error: 'Invalid date or time format' };
        }

        await updateTimelineEvent(id, {
            country,
            title,
            date,
            time,
            description,
            location,
            coordinates: { lat, lng },
            image: imageUrl,
            fullDate,
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
        const event = await getTimelineEvent(id);

        if (event && event.image) {
            // Delete image from Supabase Storage
            await deleteTimelineImage(event.image);
        }

        await deleteTimelineEvent(id);

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
        await reorderTimelineEvents(eventIds);

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
        const event = await getTimelineEvent(id);

        if (!event) {
            return { success: false, error: 'Event not found' };
        }

        // Create new event with same data but incremented order
        const newId = await createTimelineEvent({
            ...event,
            title: `${event.title} (Copia)`,
            order: event.order + 1,
        });

        revalidatePath('/[lang]/(protected)/enlace', 'page');
        revalidatePath('/[lang]/(admin)/admin/timeline', 'page');

        return { success: true, id: newId };
    } catch (error) {
        console.error('Error duplicating timeline event:', error);
        return { success: false, error: 'Failed to duplicate event' };
    }
}
