'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import LanguageSelector from '@/components/shared/LanguageSelector';
import { motion } from 'framer-motion';

export default function ProfilePage() {
    const t = useTranslations('Profile');
    const locale = useLocale();
    const router = useRouter();

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <header className="bg-white px-6 py-8 shadow-sm border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
                    <p className="text-slate-500 text-sm mt-1">{t('subtitle')}</p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 active:scale-95 transition-transform"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
            </header>

            <main className="px-6 py-8 max-w-lg mx-auto space-y-8">
                {/* Profile Section Placeholder */}
                <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                            DM
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Digvijay & María</h2>
                            <p className="text-slate-500 text-xs">2026 India & Spain</p>
                        </div>
                    </div>
                </section>

                {/* Language Selection Section */}
                <section className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">
                        {t('language_section.title')}
                    </h3>

                    <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100 flex flex-col items-center gap-6">
                        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-4xl">translate</span>
                        </div>

                        <div className="text-center space-y-2">
                            <h4 className="text-xl font-bold text-slate-900">{t('language_section.select_label')}</h4>
                            <p className="text-slate-500 text-sm leading-relaxed px-4">
                                {t('language_section.select_description')}
                            </p>
                        </div>

                        <div className="w-full pt-4">
                            <LanguageSelector />
                        </div>
                    </div>
                </section>

                {/* Other Settings Placeholder */}
                <section className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 divide-y divide-slate-50">
                    <div className="p-4 flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                                <span className="material-symbols-outlined text-xl">notifications</span>
                            </div>
                            <span className="font-bold text-slate-700">{t('settings.notifications')}</span>
                        </div>
                        <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">chevron_right</span>
                    </div>

                    <div className="p-4 flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500">
                                <span className="material-symbols-outlined text-xl">security</span>
                            </div>
                            <span className="font-bold text-slate-700">{t('settings.privacy')}</span>
                        </div>
                        <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">chevron_right</span>
                    </div>
                </section>

                {/* Logout Button */}
                <button className="w-full py-4 text-center text-rose-500 font-bold text-sm bg-rose-50 rounded-2xl active:scale-95 transition-transform">
                    {t('logout')}
                </button>
            </main>
        </div>
    );
}
