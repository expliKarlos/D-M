import { useTranslations } from 'next-intl';

export default function WeddingPage() {
    const t = useTranslations('Dashboard.nav'); // Reusing nav translations for title temporarily

    return (
        <main className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center pb-32">
            <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center mb-6">
                <span className="material-icons-outlined text-4xl text-rose-500">favorite_border</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">{t('wedding')}</h1>
            <p className="text-slate-500 dark:text-slate-400">
                Próximamente: Detalles de la ceremonia y celebración.
            </p>
        </main>
    );
}
