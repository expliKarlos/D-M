import { useParams } from 'next/navigation';
import { translateTimelineContent } from '@/lib/actions/timeline-actions';

const CACHE_KEY = 'dm-wedding-translations';

export function useWeddingEvents() {
    const params = useParams();
    const lang = (params?.lang as 'es' | 'en' | 'hi') || 'es';
    const [eventsByDate, setEventsByDate] = useState<Record<string, TimelineEvent[]>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const eventsRef = collection(db, 'timeline_events');
        const q = query(eventsRef, orderBy('order', 'asc')); // Changed to 'order' as source of truth for wedding chronology

        const unsubscribe = onSnapshot(
            q,
            async (snapshot) => {
                const grouped: Record<string, TimelineEvent[]> = {};
                const events: TimelineEvent[] = [];
                const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');

                for (const doc of snapshot.docs) {
                    const data = doc.data() as TimelineEventFirestore;

                    // Priority 1: Multi-lang fields from Firestore
                    let title = lang === 'es' ? data.title_es : lang === 'en' ? data.title_en : data.title_hi;
                    let description = lang === 'es' ? data.description_es : lang === 'en' ? data.description_en : data.description_hi;

                    // Fallback to default if matching
                    if (!title && data.title) title = data.title;
                    if (!description && data.description) description = data.description;

                    const event: TimelineEvent = {
                        id: doc.id,
                        country: data.country,
                        title: title || data.title,
                        title_es: data.title_es,
                        title_en: data.title_en,
                        title_hi: data.title_hi,
                        date: data.date,
                        time: data.time,
                        description: description || data.description,
                        description_es: data.description_es,
                        description_en: data.description_en,
                        description_hi: data.description_hi,
                        location: data.location,
                        coordinates: data.coordinates,
                        image: data.image,
                        fullDate: data.fullDate.toDate(),
                        order: data.order,
                        createdAt: data.createdAt.toDate(),
                        updatedAt: data.updatedAt.toDate(),
                    };

                    // Priority 2: Local Cache for AI Translations
                    const cacheId = `${event.id}_${lang}`;
                    if (!title && cache[cacheId]?.title) event.title = cache[cacheId].title;
                    if (!description && cache[cacheId]?.description) event.description = cache[cacheId].description;

                    events.push(event);

                    const dateKey = event.fullDate.toISOString().split('T')[0];
                    if (!grouped[dateKey]) grouped[dateKey] = [];
                    grouped[dateKey].push(event);

                    // Priority 3: Trigger AI Fallback if still missing (and not the default language)
                    // Assuming 'es' is the default and already populated in 'title/description'
                    if (lang !== 'es' && !title && !cache[cacheId]?.title) {
                        translateTimelineContent(event.title, lang, 'title').then(res => {
                            if ('text' in res) {
                                const newCache = { ...JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'), [cacheId]: { ...cache[cacheId], title: res.text } };
                                localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
                                // We don't force a full re-render here to avoid loops, it will be picked up on next snapshot or mount
                            }
                        });
                    }
                    if (lang !== 'es' && !description && !cache[cacheId]?.description) {
                        translateTimelineContent(event.description, lang, 'description').then(res => {
                            if ('text' in res) {
                                const newCache = { ...JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'), [cacheId]: { ...cache[cacheId], description: res.text } };
                                localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
                            }
                        });
                    }
                }

                setEventsByDate(grouped);
                setIsLoading(false);
                setError(null);
            },
            (err) => {
                console.error('Error in useWeddingEvents:', err);
                setError('Failed to sync events.');
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [lang]);

    return { eventsByDate, isLoading, error };
}
