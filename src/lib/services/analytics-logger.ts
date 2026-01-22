import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';

/**
 * Event types that can be logged
 */
export type AnalyticsEventType =
    | 'wish_created'
    | 'photo_uploaded'
    | 'ai_question'
    | 'bus_info_clicked'
    | 'rsvp_confirmed';

/**
 * Analytics event structure
 */
export interface AnalyticsEvent {
    eventType: AnalyticsEventType;
    metadata: Record<string, any>;
    timestamp: number;
    userAgent: string;
    locale: string;
}

/**
 * Log an analytics event to Firestore
 * @param eventType - Type of event to log
 * @param metadata - Additional data specific to the event
 */
export async function logEvent(
    eventType: AnalyticsEventType,
    metadata?: Record<string, any>
): Promise<void> {
    // Only log in browser environment
    if (typeof window === 'undefined') {
        return;
    }

    try {
        await addDoc(collection(db, 'analytics_events'), {
            eventType,
            metadata: metadata || {},
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            locale: document.documentElement.lang || 'es',
        });
    } catch (error) {
        // Silent fail - don't disrupt user experience
        console.error('Analytics logging failed:', error);
    }
}

/**
 * Helper to get human-readable label for event type
 */
export function getEventLabel(eventType: AnalyticsEventType): string {
    const labels: Record<AnalyticsEventType, string> = {
        wish_created: '💬 Deseos escritos',
        photo_uploaded: '📸 Fotos subidas',
        rsvp_confirmed: '✅ RSVPs confirmados',
        ai_question: '🤖 Preguntas IA',
        bus_info_clicked: '🚌 Info autobús',
    };
    return labels[eventType] || eventType;
}
