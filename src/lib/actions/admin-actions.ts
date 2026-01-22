'use server';

import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/services/firebase-admin';
import { createClient } from '@supabase/supabase-js';

// Helper to verify admin
async function isUserAdmin(email: string): Promise<boolean> {
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    return adminEmails.includes(email);
}

/**
 * Delete a wish from Firestore
 */
export async function deleteWish(wishId: string, userEmail: string) {
    try {
        // Verify admin
        if (!await isUserAdmin(userEmail)) {
            return { success: false, error: 'Unauthorized' };
        }

        // Get wish to check if it has an image
        const db = adminDb();
        if (!db) throw new Error('Firebase Admin not initialized');

        const wishDoc = await db.collection('wishes').doc(wishId).get();
        const wishData = wishDoc.data();

        // Delete from Firestore
        await db.collection('wishes').doc(wishId).delete();

        // If wish had an image, delete from Supabase Storage
        if (wishData?.imageUrl) {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            // Extract file path from URL
            const url = new URL(wishData.imageUrl);
            const pathParts = url.pathname.split('/');
            const bucket = pathParts[pathParts.length - 2];
            const filePath = pathParts.slice(pathParts.length - 2).join('/');

            await supabase.storage.from(bucket).remove([filePath]);
        }

        revalidatePath('/admin/wishes');
        return { success: true };
    } catch (error) {
        console.error('Error deleting wish:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Delete a photo from Supabase Storage and Firestore (if exists)
 */
export async function deletePhoto(photoPath: string, userEmail: string) {
    try {
        // Verify admin
        if (!await isUserAdmin(userEmail)) {
            return { success: false, error: 'Unauthorized' };
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Delete from Supabase Storage
        const { error: storageError } = await supabase.storage
            .from('photos')
            .remove([photoPath]);

        if (storageError) {
            throw storageError;
        }

        // Try to delete from Firestore if reference exists
        try {
            const db = adminDb();
            const photoId = photoPath.split('/').pop()?.split('.')[0];
            if (photoId && db) {
                await db.collection('photos').doc(photoId).delete();
            }
        } catch (firestoreError) {
            // Ignore if doesn't exist in Firestore
            console.log('Photo not in Firestore or already deleted');
        }

        revalidatePath('/admin/photos');
        revalidatePath('/participa');
        return { success: true };
    } catch (error) {
        console.error('Error deleting photo:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Bulk delete photos from Supabase Storage and Firestore
 */
export async function bulkDeletePhotos(photoIds: string[], photoPaths: string[], userEmail: string) {
    try {
        if (!await isUserAdmin(userEmail)) {
            return { success: false, error: 'Unauthorized' };
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const db = adminDb();
        if (!db) throw new Error('Firebase Admin not initialized');

        // 1. Delete from Supabase Storage
        const { error: storageError } = await supabase.storage
            .from('photos')
            .remove(photoPaths);

        if (storageError) throw storageError;

        // 2. Delete from Firestore in chunks
        const batchSize = 10;
        for (let i = 0; i < photoIds.length; i += batchSize) {
            const chunk = photoIds.slice(i, i + batchSize);
            const batch = db.batch();
            chunk.forEach(id => {
                batch.delete(db.collection('photos').doc(id));
            });
            await batch.commit();
        }

        revalidatePath('/admin/photos');
        revalidatePath('/participa');
        return { success: true };
    } catch (error) {
        console.error('Error in bulk deletion:', error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Update the moment (folder) of a photo
 */
export async function updatePhotoMoment(photoId: string, momentId: string, userEmail: string) {
    try {
        if (!await isUserAdmin(userEmail)) {
            return { success: false, error: 'Unauthorized' };
        }

        const db = adminDb();
        if (!db) throw new Error('Firebase Admin not initialized');

        await db.collection('photos').doc(photoId).update({
            moment: momentId,
            updatedAt: Date.now()
        });

        revalidatePath('/admin/photos');
        revalidatePath('/participa');
        return { success: true };
    } catch (error) {
        console.error('Error updating photo moment:', error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Get admin statistics with time-based metrics
 */
export async function getAdminStats(userEmail: string) {
    try {
        // Verify admin
        if (!await isUserAdmin(userEmail)) {
            return { success: false, error: 'Unauthorized' };
        }

        // Get wishes
        const db = adminDb();
        if (!db) throw new Error('Firebase Admin not initialized');

        const wishesSnapshot = await db.collection('wishes').get();
        const allWishes = wishesSnapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
        }));

        const wishCount = allWishes.length;

        // Time-based calculations
        const now = Date.now();
        const todayStart = new Date().setHours(0, 0, 0, 0);
        const weekStart = now - 7 * 24 * 60 * 60 * 1000;

        const wishesToday = allWishes.filter((w: any) => w.timestamp >= todayStart).length;
        const wishesThisWeek = allWishes.filter((w: any) => w.timestamp >= weekStart).length;

        const photosSnapshot = await db.collection('photos').get();
        const allPhotos = photosSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const photoCount = allPhotos.length;

        // Time-based photo calculations
        const photosToday = allPhotos.filter((p: any) => p.timestamp >= todayStart).length;
        const photosThisWeek = allPhotos.filter((p: any) => p.timestamp >= weekStart).length;

        // Get recent wishes (last 5)
        const recentWishes = allWishes
            .sort((a: any, b: any) => b.timestamp - a.timestamp)
            .slice(0, 5);

        // Get recent photos (last 6)
        const recentPhotos = allPhotos
            .sort((a: any, b: any) => b.timestamp - a.timestamp)
            .slice(0, 6)
            .map((p: any) => ({
                id: p.id,
                name: p.name || p.id,
                url: p.url || p.content,
                timestamp: p.timestamp
            }));

        return {
            success: true,
            stats: {
                wishCount,
                wishesToday,
                wishesThisWeek,
                photoCount,
                photosToday,
                photosThisWeek,
                recentWishes,
                recentPhotos
            }
        };
    } catch (error) {
        console.error('Error getting admin stats:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Get analytics statistics from Firestore
 */
export async function getAnalyticsStats(userEmail: string) {
    try {
        if (!await isUserAdmin(userEmail)) {
            return { success: false, error: 'Unauthorized' };
        }

        const db = adminDb();
        if (!db) throw new Error('Firebase Admin not initialized');

        const eventsSnapshot = await db.collection('analytics_events').get();
        const allEvents = eventsSnapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
        }));

        const totalEvents = allEvents.length;
        const now = Date.now();
        const todayStart = new Date().setHours(0, 0, 0, 0);
        const weekStart = now - 7 * 24 * 60 * 60 * 1000;

        const todayEvents = allEvents.filter((e: any) => e.timestamp >= todayStart).length;
        const weekEvents = allEvents.filter((e: any) => e.timestamp >= weekStart);

        const eventsByType = weekEvents.reduce((acc: Record<string, number>, event: any) => {
            acc[event.eventType] = (acc[event.eventType] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const top3Events = Object.entries(eventsByType)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .slice(0, 3)
            .map(([type, count]) => ({ type, count }));

        return {
            success: true,
            stats: {
                totalEvents,
                todayEvents,
                weekEvents: weekEvents.length,
                eventsByType,
                top3Events,
            }
        };
    } catch (error) {
        console.error('Error getting analytics stats:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Get all photos from Firestore for Admin management
 */
export async function getAdminPhotos(userEmail: string) {
    try {
        if (!await isUserAdmin(userEmail)) {
            return { success: false, error: 'Unauthorized' };
        }

        const db = adminDb();
        if (!db) throw new Error('Firebase Admin not initialized');

        const snapshot = await db.collection('photos').orderBy('timestamp', 'desc').get();
        const photos = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return { success: true, photos };
    } catch (error) {
        console.error('Error getting admin photos:', error);
        return { success: false, error: (error as Error).message };
    }
}
