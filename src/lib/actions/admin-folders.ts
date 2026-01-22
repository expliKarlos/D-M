'use server';

import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/services/firebase-admin';

export interface Moment {
    id: string;
    name: string;
    icon: string;
    cover?: string;
    description?: string;
    order?: number;
}

/**
 * Get all moments (folders) from Firestore
 */
export async function getMoments(): Promise<Moment[]> {
    try {
        const db = adminDb();
        if (!db) throw new Error('Firebase Admin not initialized');

        const snapshot = await db.collection('moments').orderBy('order', 'asc').get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Moment));
    } catch (error) {
        console.error('Error getting moments:', error);
        return [];
    }
}

/**
 * Save or Update a Moment
 */
export async function saveMoment(moment: Partial<Moment> & { name: string }) {
    try {
        const db = adminDb();
        if (!db) throw new Error('Firebase Admin not initialized');

        const momentId = moment.id || moment.name.toLowerCase().replace(/\s+/g, '-');

        await db.collection('moments').doc(momentId).set({
            ...moment,
            id: momentId,
            order: moment.order || 0,
            updatedAt: Date.now()
        }, { merge: true });

        revalidatePath('/admin/folders');
        revalidatePath('/participa');
        return { success: true, id: momentId };
    } catch (error) {
        console.error('Error saving moment:', error);
        return { success: false, error: (error as Error).message };
    }
}

/**
 * Delete a Moment
 * Note: This doesn't delete the photos, just the folder reference.
 */
export async function deleteMoment(momentId: string) {
    try {
        const db = adminDb();
        if (!db) throw new Error('Firebase Admin not initialized');

        await db.collection('moments').doc(momentId).delete();

        revalidatePath('/admin/folders');
        revalidatePath('/participa');
        return { success: true };
    } catch (error) {
        console.error('Error deleting moment:', error);
        return { success: false, error: (error as Error).message };
    }
}
