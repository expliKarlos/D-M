import { useTranslations } from 'next-intl';

export default function PlanningPage() {
    const t = useTranslations('Dashboard.nav');

    return (
        <main className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center pb-32">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-6">
                <span className="material-icons-outlined text-4xl text-emerald-500">event_note</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">{t('planning')}</h1>
            <p className="text-slate-500 dark:text-slate-400">
                Próximamente: Itinerario de viaje y recomendaciones.
            </p>
        </main>
    );
}
