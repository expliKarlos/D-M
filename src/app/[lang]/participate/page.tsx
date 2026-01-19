import { useTranslations } from 'next-intl';

export default function ParticipatePage() {
    const t = useTranslations('Dashboard.nav');

    return (
        <main className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center pb-32">
            <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-6">
                <span className="material-icons-outlined text-4xl text-amber-500">celebration</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">{t('participate')}</h1>
            <p className="text-slate-500 dark:text-slate-400">
                Próximamente: Confirmar asistencia y regalos.
            </p>
        </main>
    );
}
