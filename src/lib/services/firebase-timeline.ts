import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    Timestamp,
    writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import type { TimelineEvent, TimelineEventFirestore } from '@/types/timeline';

const COLLECTION_NAME = 'timeline_events';

// Convert Firestore document to TimelineEvent
function firestoreToEvent(id: string, data: TimelineEventFirestore): TimelineEvent {
    return {
        id,
        country: data.country,
        title: data.title,
        date: data.date,
        time: data.time,
        description: data.description,
        location: data.location,
        coordinates: data.coordinates,
        image: data.image,
        fullDate: data.fullDate.toDate(),
        order: data.order,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
    };
}

// Convert TimelineEvent to Firestore format
function eventToFirestore(event: Partial<TimelineEvent>): Partial<TimelineEventFirestore> {
    const firestoreData: Partial<TimelineEventFirestore> = {};

    if (event.country) firestoreData.country = event.country;
    if (event.title) firestoreData.title = event.title;
    if (event.date) firestoreData.date = event.date;
    if (event.time) firestoreData.time = event.time;
    if (event.description) firestoreData.description = event.description;
    if (event.location) firestoreData.location = event.location;
    if (event.coordinates) firestoreData.coordinates = event.coordinates;
    if (event.image) firestoreData.image = event.image;
    if (event.fullDate) firestoreData.fullDate = Timestamp.fromDate(event.fullDate);
    if (event.order !== undefined) firestoreData.order = event.order;

    return firestoreData;
}

/**
 * Get all timeline events ordered by 'order' field
 */
export async function getTimelineEvents(): Promise<TimelineEvent[]> {
    try {
        const eventsRef = collection(db, COLLECTION_NAME);
        const q = query(eventsRef, orderBy('order', 'asc'));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc =>
            firestoreToEvent(doc.id, doc.data() as TimelineEventFirestore)
        );
    } catch (error) {
        console.error('Error fetching timeline events:', error);
        throw error;
    }
}

/**
 * Get a single timeline event by ID
 */
export async function getTimelineEvent(id: string): Promise<TimelineEvent | null> {
    try {
        const eventRef = doc(db, COLLECTION_NAME, id);
        const snapshot = await getDoc(eventRef);

        if (!snapshot.exists()) {
            return null;
        }

        return firestoreToEvent(snapshot.id, snapshot.data() as TimelineEventFirestore);
    } catch (error) {
        console.error('Error fetching timeline event:', error);
        throw error;
    }
}

/**
 * Create a new timeline event
 */
export async function createTimelineEvent(data: Omit<TimelineEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
        const eventsRef = collection(db, COLLECTION_NAME);
        const now = Timestamp.now();

        const firestoreData: Omit<TimelineEventFirestore, 'id'> = {
            country: data.country,
            title: data.title,
            date: data.date,
            time: data.time,
            description: data.description,
            location: data.location,
            coordinates: data.coordinates,
            image: data.image,
            fullDate: Timestamp.fromDate(data.fullDate),
            order: data.order,
            createdAt: now,
            updatedAt: now,
        };

        const docRef = await addDoc(eventsRef, firestoreData);
        return docRef.id;
    } catch (error) {
        console.error('Error creating timeline event:', error);
        throw error;
    }
}

/**
 * Update an existing timeline event
 */
export async function updateTimelineEvent(id: string, data: Partial<TimelineEvent>): Promise<void> {
    try {
        const eventRef = doc(db, COLLECTION_NAME, id);
        const firestoreData = eventToFirestore(data);

        await updateDoc(eventRef, {
            ...firestoreData,
            updatedAt: Timestamp.now(),
        });
    } catch (error) {
        console.error('Error updating timeline event:', error);
        throw error;
    }
}

/**
 * Delete a timeline event
 */
export async function deleteTimelineEvent(id: string): Promise<void> {
    try {
        const eventRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(eventRef);
    } catch (error) {
        console.error('Error deleting timeline event:', error);
        throw error;
    }
}

/**
 * Reorder timeline events (batch update)
 */
export async function reorderTimelineEvents(eventIds: string[]): Promise<void> {
    try {
        const batch = writeBatch(db);

        eventIds.forEach((id, index) => {
            const eventRef = doc(db, COLLECTION_NAME, id);
            batch.update(eventRef, {
                order: index,
                updatedAt: Timestamp.now(),
            });
        });

        await batch.commit();
    } catch (error) {
        console.error('Error reordering timeline events:', error);
        throw error;
    }
}
