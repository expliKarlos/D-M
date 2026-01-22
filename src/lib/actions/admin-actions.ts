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
 * Get admin statistics
 */
export async function getAdminStats(userEmail: string) {
    try {
        // Verify admin
        if (!await isUserAdmin(userEmail)) {
            return { success: false, error: 'Unauthorized' };
        }

        // Get wishes count
        const db = adminDb();
        if (!db) throw new Error('Firebase Admin not initialized');

        const wishesSnapshot = await db.collection('wishes').get();
        const wishCount = wishesSnapshot.size;

        // Get photos count from Supabase
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: photos } = await supabase.storage
            .from('photos')
            .list('participation-gallery');

        const photoCount = photos?.length || 0;

        // Get recent wishes (last 5)
        const recentWishesSnapshot = await db.collection('wishes')
            .orderBy('timestamp', 'desc')
            .limit(5)
            .get();

        const recentWishes = recentWishesSnapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
        }));

        return {
            success: true,
            stats: {
                wishCount,
                photoCount,
                recentWishes
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
