'use client';

import { useTranslations } from 'next-intl';
import EventCard from '@/components/shared/EventCard';

const MOCK_EVENTS = [
    {
        id: 'sangeet',
        title: 'Sangeet & Cóctel',
        date: '2026-09-18',
        startTime: '19:00',
        description: 'Una noche de música, baile y celebración tradicional para dar la bienvenida a nuestros invitados.',
        locationName: 'Jaipur Palace Garden',
        coordinates: { lat: 26.9124, lng: 75.7873 }
    },
    {
        id: 'wedding',
        title: 'Ceremonia Pheras',
        date: '2026-09-20',
        startTime: '10:00',
        description: 'La ceremonia principal donde uniremos nuestras vidas bajo el rito tradicional hindú.',
        locationName: 'Lake View Temple',
        coordinates: { lat: 26.9650, lng: 75.8591 }
    }
];

export default function PlanningPage() {
    const t = useTranslations('Dashboard.nav');

    return (
        <main className="min-h-screen bg-background-light px-6 pt-12 pb-40">
            <header className="mb-10">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('planning')}</h1>
                <p className="text-slate-500 text-sm">
                    Mantente sincronizado con los hitos más importantes de nuestra unión.
                </p>
            </header>

            <div className="flex flex-col gap-6">
                {MOCK_EVENTS.map(event => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>

            <div className="mt-12 p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex flex-col gap-3">
                <h4 className="font-bold text-emerald-800">Sincronización Automática</h4>
                <p className="text-xs text-emerald-700 leading-relaxed">
                    Los cambios en la agenda se sincronizan automáticamente incluso si no tienes conexión estable.
                </p>
            </div>
        </main>
    );
}
