'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import LanguageSelector from '@/components/shared/LanguageSelector';
import { motion, AnimatePresence } from 'framer-motion';
import { urlBase64ToUint8Array } from '@/lib/utils/vapid';

export default function ProfilePage() {
    const t = useTranslations('Profile');
    const locale = useLocale();
    const router = useRouter();

    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

    useEffect(() => {
        const checkSubscription = async () => {
            if ('serviceWorker' in navigator && 'PushManager' in window) {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();
                setIsSubscribed(!!subscription);
            }
            setIsLoading(false);
        };
        checkSubscription();
    }, []);

    const showFeedback = (type: 'success' | 'error', message: string) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback({ type: null, message: '' }), 5000);
    };

    const togglePush = async () => {
        if (isLoading) return;
        setIsLoading(true);

        try {
            if (isSubscribed) {
                // Unsubscribe
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();
                if (subscription) {
                    await subscription.unsubscribe();
                    await fetch('/api/push/subscribe', {
                        method: 'POST',
                        body: JSON.stringify({ subscription, action: 'unsubscribe' }),
                    });
                }
                setIsSubscribed(false);
                showFeedback('success', 'Notificaciones desactivadas');
            } else {
                // Subscribe
                if (Notification.permission === 'denied') {
                    showFeedback('error', 'Permiso bloqueado. Actívalo en los ajustes del navegador.');
                    setIsLoading(false);
                    return;
                }

                const registration = await navigator.serviceWorker.ready;
                const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

                if (!publicVapidKey) {
                    throw new Error('VAPID public key not found');
                }

                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
                });

                const res = await fetch('/api/push/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ subscription }),
                });

                if (!res.ok) throw new Error('Failed to save subscription');

                setIsSubscribed(true);
                showFeedback('success', '¡Listo! Te avisaremos de todo');
            }
        } catch (error) {
            console.error('Error toggling push:', error);
            showFeedback('error', 'Error al configurar notificaciones');
        } finally {
            setIsLoading(false);
        }
    };

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
                {/* Profile Section */}
                <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF9933] to-orange-400 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                            DM
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Digvijay & María</h2>
                            <p className="text-slate-500 text-xs">2026 India & Spain</p>
                        </div>
                    </div>
                </section>

                {/* Notifications Section */}
                <section className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">
                        {t('settings.notifications')}
                    </h3>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 ${isSubscribed ? 'bg-orange-100 text-[#FF9933]' : 'bg-slate-100 text-slate-400'} rounded-full flex items-center justify-center transition-colors`}>
                                    <span className="material-symbols-outlined text-xl">
                                        {isSubscribed ? 'notifications_active' : 'notifications'}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-bold text-slate-700 block">Recibir notificaciones</span>
                                    <span className="text-xs text-slate-400">Avisos de agenda y sorpresas</span>
                                </div>
                            </div>

                            <button
                                onClick={togglePush}
                                disabled={isLoading}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isSubscribed ? 'bg-[#FF9933]' : 'bg-slate-200'}`}
                            >
                                <span
                                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isSubscribed ? 'translate-x-5' : 'translate-x-0'}`}
                                />
                            </button>
                        </div>

                        <AnimatePresence>
                            {feedback.type && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className={`mt-4 p-3 rounded-xl text-xs font-medium ${feedback.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}
                                >
                                    {feedback.message}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>

                {/* Language Selection Section */}
                <section className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">
                        {t('language_section.title')}
                    </h3>

                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center gap-6">
                        <LanguageSelector />
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
