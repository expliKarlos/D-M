'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import LanguageSelector from '@/components/shared/LanguageSelector';
import { motion, AnimatePresence } from 'framer-motion';
import { urlBase64ToUint8Array } from '@/lib/utils/vapid';
import ThemeSelector from '@/components/profile/ThemeSelector';
import FontSelector from '@/components/profile/FontSelector';

export default function ProfilePage() {
    const t = useTranslations('Profile');
    const locale = useLocale();
    const router = useRouter();

    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

    useEffect(() => {
        const checkSubscription = async () => {
            try {
                if ('serviceWorker' in navigator && 'PushManager' in window) {
                    // Try to get registration with a short timeout to prevent hanging
                    const registration = await Promise.race([
                        navigator.serviceWorker.ready,
                        new Promise<ServiceWorkerRegistration>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
                    ]).catch(() => navigator.serviceWorker.getRegistration());

                    if (registration) {
                        const subscription = await registration.pushManager.getSubscription();
                        setIsSubscribed(!!subscription);
                    }
                }
            } catch (err) {
                console.warn('Error checking push subscription:', err);
            } finally {
                setIsLoading(false);
            }
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
                const registration = await navigator.serviceWorker.getRegistration();
                if (registration) {
                    const subscription = await registration.pushManager.getSubscription();
                    if (subscription) {
                        await subscription.unsubscribe();
                        await fetch('/api/push/subscribe', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ subscription, action: 'unsubscribe' }),
                        });
                    }
                }
                setIsSubscribed(false);
                showFeedback('success', 'Notificaciones desactivadas');
            } else {
                // Subscribe
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    showFeedback('error', 'Permiso denegado. Actívalo en los ajustes del navegador.');
                    setIsLoading(false);
                    return;
                }

                const registration = await navigator.serviceWorker.getRegistration();
                if (!registration) throw new Error('Service Worker not registered');

                const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
                if (!publicVapidKey) throw new Error('VAPID public key not found');

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
        <div className="min-h-screen bg-slate-50 pb-24 font-sans">
            <header className="bg-white px-6 py-8 shadow-sm border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('title')}</h1>
                    <p className="text-slate-500 text-sm mt-0.5">{t('subtitle')}</p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 active:scale-90 transition-transform"
                >
                    <span className="material-symbols-outlined text-xl">close</span>
                </button>
            </header>

            <main className="px-6 py-8 max-w-lg mx-auto space-y-6">
                {/* Profile Card */}
                <section className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FF9933] to-orange-400 flex items-center justify-center text-white text-xl font-bold shadow-md">
                        DM
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900 leading-tight">Digvijay & María</h2>
                        <p className="text-slate-400 text-xs font-medium">Invitado VIP • 2026 India</p>
                    </div>
                </section>

                {/* Notifications & Settings Section */}
                <section className="space-y-3">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-3">
                        Configuración de la App
                    </h3>

                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-6">
                        {/* Notifications Interaction Area */}
                        {!isLoading && typeof window !== 'undefined' && !('PushManager' in window) ? (
                            <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col gap-3">
                                <div className="flex items-center gap-3 text-blue-600">
                                    <span className="material-symbols-outlined">info</span>
                                    <span className="font-bold text-[13px]">{t('notification_card.not_supported_title')}</span>
                                </div>
                                <p className="text-[11px] text-blue-600/80 font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: t('notification_card.not_supported_desc') }} />
                            </div>
                        ) : (
                            <div
                                onClick={togglePush}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer group flex items-center justify-between ${isSubscribed
                                    ? 'bg-orange-50/50 border-orange-100 shadow-sm'
                                    : 'bg-slate-50 border-slate-100'
                                    } active:scale-[0.98]`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-11 h-11 ${isSubscribed ? 'bg-orange-100 text-[#FF9933] shadow-inner' : 'bg-white text-slate-400 border border-slate-100'} rounded-2xl flex items-center justify-center transition-all duration-500`}>
                                        <span className="material-symbols-outlined text-xl">
                                            {isSubscribed ? 'notifications_active' : 'notifications'}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-800 text-[13px] block">{t('notification_card.title')}</span>
                                        <span className={`text-[10px] font-bold uppercase tracking-tight ${isSubscribed ? 'text-green-600' : 'text-slate-400'}`}>
                                            {isSubscribed ? t('notification_card.status_active') : t('notification_card.status_inactive')}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-slate-300 border-t-primary rounded-full animate-spin" />
                                    ) : (
                                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold transition-all ${isSubscribed
                                            ? 'bg-orange-500 text-white shadow-sm'
                                            : 'bg-white text-slate-600 border border-slate-200'
                                            }`}>
                                            {isSubscribed ? t('notification_card.deactivate') : t('notification_card.activate')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Divider */}
                        <div className="h-px bg-slate-50 mx-2" />

                        {/* Language Row */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-xl">translate</span>
                                </div>
                                <div>
                                    <span className="font-bold text-slate-800 text-[13px] block">Idioma</span>
                                    <span className="text-[10px] text-slate-400 font-medium tracking-tight">App localization</span>
                                </div>
                            </div>
                            <LanguageSelector compact />
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-slate-50 mx-2" />

                        {/* Theme Selector */}
                        <ThemeSelector lng={locale} />

                        {/* Divider */}
                        <div className="h-px bg-slate-50 mx-2" />

                        {/* Font Selector */}
                        <FontSelector />

                        <AnimatePresence>
                            {feedback.type && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                    animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                    className={`p-3 rounded-2xl text-[11px] font-bold text-center ${feedback.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}
                                >
                                    {feedback.message}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Test Section (Visible when subscribed) */}
                        {isSubscribed && (
                            <button
                                onClick={async () => {
                                    if (isLoading) return;
                                    setIsLoading(true);
                                    try {
                                        const res = await fetch('/api/push/test', { method: 'POST' });
                                        if (res.ok) showFeedback('success', t('notification_card.test_feedback_success'));
                                        else throw new Error();
                                    } catch {
                                        showFeedback('error', t('notification_card.test_feedback_error'));
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }}
                                disabled={isLoading}
                                className="w-full py-3.5 bg-gradient-to-r from-orange-50 to-orange-100/50 text-[#FF9933] rounded-2xl text-[11px] font-extrabold hover:from-orange-100 hover:to-orange-200/50 transition-all flex items-center justify-center gap-2 border border-orange-200/30 mt-2 shadow-sm active:scale-[0.98]"
                            >
                                <span className="material-symbols-outlined text-sm">notifications_active</span>
                                {t('notification_card.test_button')}
                            </button>
                        )}
                    </div>
                </section>

                {/* Logout Button */}
                <button className="w-full py-4 text-center text-rose-400 font-bold text-xs bg-white rounded-3xl border border-slate-100 active:bg-rose-50 active:text-rose-600 transition-all shadow-sm">
                    {t('logout')}
                </button>
            </main>
        </div >
    );
}
