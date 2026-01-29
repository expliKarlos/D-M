'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import LanguageSelector from '@/components/shared/LanguageSelector';
import { motion, AnimatePresence } from 'framer-motion';
import { urlBase64ToUint8Array } from '@/lib/utils/vapid';
import ThemeSelector from '@/components/profile/ThemeSelector';
import FontSelector from '@/components/profile/FontSelector';
import UserChecklist from '@/components/profile/UserChecklist';
import { checkPushSubscription, requestPushSubscription, unsubscribePush } from '@/lib/utils/push-notifications-client';
import { useGamificationStore } from '@/lib/store/gamification-store';
import { Trophy, Coins, Zap, Heart, Flame } from 'lucide-react';

export default function ProfilePage() {
    const t = useTranslations('Profile');
    const locale = useLocale();
    const router = useRouter();
    const { loveTokens, badges } = useGamificationStore();

    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
    const [activeTab, setActiveTab] = useState<'profile' | 'tasks' | 'settings'>('settings');

    useEffect(() => {
        const checkSub = async () => {
            const sub = await checkPushSubscription();
            setIsSubscribed(sub);
            setIsLoading(false);
        };
        checkSub();
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
                await unsubscribePush();
                setIsSubscribed(false);
                showFeedback('success', 'Notificaciones desactivadas');
            } else {
                await requestPushSubscription();
                setIsSubscribed(true);
                showFeedback('success', '¡Listo! Te avisaremos de todo');
            }
        } catch (error: any) {
            console.error('Error toggling push:', error);
            if (error.message === 'PERMISSION_DENIED') {
                showFeedback('error', 'Permiso denegado. Actívalo en los ajustes del navegador.');
            } else {
                showFeedback('error', 'Error al configurar notificaciones');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', label: t('tabs.profile'), icon: 'person' },
        { id: 'tasks', label: t('tabs.tasks'), icon: 'checklist' },
        { id: 'settings', label: t('tabs.settings'), icon: 'settings' },
    ] as const;

    return (
        <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900">
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 py-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-black tracking-tight">{t('title')}</h1>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{t('subtitle')}</p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 rounded-full bg-slate-100/50 flex items-center justify-center text-slate-400 hover:text-slate-600 active:scale-90 transition-all"
                >
                    <span className="material-symbols-outlined text-xl">close</span>
                </button>
            </header>

            <main className="px-6 py-8 max-w-lg mx-auto flex flex-col gap-6">
                {/* Elegant Dashboard Navigation */}
                <nav className="grid grid-cols-3 gap-3">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                relative flex flex-col items-center justify-center py-5 rounded-[2rem] transition-all duration-500 overflow-hidden
                                ${activeTab === tab.id
                                    ? 'bg-white shadow-xl shadow-orange-500/10 text-orange-500 border border-orange-100'
                                    : 'bg-white/40 text-slate-400 border border-transparent grayscale opacity-70 hover:opacity-100'
                                }
                            `}
                        >
                            <span className={`material-symbols-outlined text-2xl transition-transform duration-500 mb-2 ${activeTab === tab.id ? 'scale-110' : ''}`}>
                                {tab.icon}
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-[0.15em]">{tab.label}</span>
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="tabDot"
                                    className="absolute bottom-2 w-1 h-1 bg-orange-500 rounded-full"
                                />
                            )}
                        </button>
                    ))}
                </nav>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="min-h-[400px]"
                    >
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                {/* Profile Dashboard (Migrated from MisDatos) */}
                                <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col gap-6 relative overflow-hidden">
                                    {/* Background decoration */}
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-50 rounded-full blur-3xl opacity-50" />
                                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50" />

                                    <header className="flex items-center justify-between relative z-10">
                                        <div>
                                            <h2 className="text-2xl font-cinzel font-black text-slate-900 mb-1">Tu Perfil</h2>
                                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">Invitado VIP • Explorador Imperial</p>
                                        </div>
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FF9933] to-teal p-0.5 shadow-lg">
                                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-cinzel font-bold text-xl text-[#FF9933]">
                                                DM
                                            </div>
                                        </div>
                                    </header>

                                    {/* LoveTokens Wallet */}
                                    <div className="relative overflow-hidden bg-slate-50/50 backdrop-blur-sm rounded-[2rem] border border-slate-100 p-8 shadow-inner relative z-10">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                            <Coins size={120} className="rotate-12" />
                                        </div>

                                        <div className="relative z-10">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Heart className="text-rose-500 fill-rose-500" size={14} />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LoveTokens Wallet</span>
                                            </div>

                                            <div className="flex items-end gap-3">
                                                <motion.span
                                                    key={loveTokens}
                                                    initial={{ scale: 1.5, color: '#FF9933' }}
                                                    animate={{ scale: 1, color: '#0f172a' }}
                                                    className="text-6xl font-cinzel font-black"
                                                >
                                                    {loveTokens}
                                                </motion.span>
                                                <div className="flex flex-col mb-2">
                                                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-tight">Disponibles</span>
                                                    <div className="flex gap-1 mt-1">
                                                        {[1, 2, 3].map((i) => (
                                                            <motion.div
                                                                key={i}
                                                                animate={{
                                                                    y: [0, -6, 0],
                                                                    opacity: [0.4, 1, 0.4]
                                                                }}
                                                                transition={{
                                                                    repeat: Infinity,
                                                                    duration: 2,
                                                                    delay: i * 0.4
                                                                }}
                                                                className="w-2.5 h-2.5 rounded-full bg-[#FF9933] shadow-sm"
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <button className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-xl shadow-slate-900/10">
                                                <Zap size={16} className="text-saffron" />
                                                Canjear Recompensas
                                            </button>
                                        </div>
                                    </div>

                                    {/* Badges Grid */}
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Insignias de Aventura</h3>
                                            <span className="text-[9px] font-black bg-orange-50 text-orange-500 px-3 py-1 rounded-full uppercase tracking-widest border border-orange-100">{badges.length} Ganadas</span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-4">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className={`aspect-square rounded-2xl flex items-center justify-center border-2 transition-all ${badges[i - 1] ? 'border-orange-500/20 bg-orange-500/5 shadow-md shadow-orange-500/5' : 'border-dashed border-slate-100 bg-slate-50/50 opacity-40'}`}>
                                                    <Trophy size={20} className={badges[i - 1] ? 'text-orange-500' : 'text-slate-300'} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                                    <div className="flex items-center gap-4 py-4 border-b border-slate-50">
                                        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center shadow-inner">
                                            <span className="material-symbols-outlined text-xl">mail</span>
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-0.5">Email Principal</span>
                                            <span className="text-xs font-bold text-slate-800">digvijay.maria@wedding.com</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 py-4">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shadow-inner">
                                            <span className="material-symbols-outlined text-xl">dataset</span>
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-0.5">Mesa Asignada</span>
                                            <span className="text-xs font-bold text-slate-800">Imperial Lounge - Mesa 4</span>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === 'tasks' && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                                    <UserChecklist />
                                </div>
                                <div className="p-6 bg-orange-50/50 rounded-3xl border border-dashed border-orange-200 text-center">
                                    <p className="text-[11px] text-orange-700 font-bold leading-relaxed italic">
                                        "Tus tareas se sincronizan automáticamente con la Guía de India. ¡Prepara tu viaje sin estrés!"
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-8">
                                    {/* Notifications Switcher Card */}
                                    {!isLoading && typeof window !== 'undefined' && !('PushManager' in window) ? (
                                        <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                                            <div className="flex items-center gap-3 text-blue-600 mb-2">
                                                <span className="material-symbols-outlined font-bold">info</span>
                                                <span className="font-black text-[14px] uppercase tracking-tight">{t('notification_card.not_supported_title')}</span>
                                            </div>
                                            <p className="text-[11px] text-blue-600/70 font-bold leading-relaxed" dangerouslySetInnerHTML={{ __html: t('notification_card.not_supported_desc') }} />
                                        </div>
                                    ) : (
                                        <div
                                            onClick={togglePush}
                                            className={`p-5 rounded-[2rem] border transition-all cursor-pointer group flex items-center justify-between ${isSubscribed
                                                ? 'bg-[#FF9933]/5 border-orange-200'
                                                : 'bg-slate-50 border-slate-100'
                                                } active:scale-[0.98] shadow-sm`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-14 h-14 ${isSubscribed ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white text-slate-400 border border-slate-100 shadow-inner'} rounded-2xl flex items-center justify-center transition-all duration-500`}>
                                                    <span className="material-symbols-outlined text-2xl">
                                                        {isSubscribed ? 'notifications_active' : 'notifications_off'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-900 text-sm uppercase tracking-tight">{t('notification_card.title')}</span>
                                                    <span className={`text-[10px] font-black uppercase tracking-[0.1em] mt-0.5 ${isSubscribed ? 'text-green-500' : 'text-slate-400'}`}>
                                                        {isSubscribed ? t('notification_card.status_active') : t('notification_card.status_inactive')}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className={`w-12 h-6 rounded-full p-1 transition-all duration-500 ${isSubscribed ? 'bg-orange-500' : 'bg-slate-300'}`}>
                                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transition-all duration-500 transform ${isSubscribed ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Test Push Button */}
                                    {isSubscribed && (
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
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
                                            className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 active:scale-95 transition-all"
                                        >
                                            {t('notification_card.test_button')}
                                        </button>
                                    )}

                                    <div className="h-px bg-slate-50 mx-4" />

                                    {/* Language, Theme, Font Options */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shadow-inner">
                                                    <span className="material-symbols-outlined text-xl">translate</span>
                                                </div>
                                                <div>
                                                    <span className="font-black text-slate-900 text-sm uppercase tracking-tight">Idioma</span>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">App Language</span>
                                                </div>
                                            </div>
                                            <LanguageSelector compact />
                                        </div>

                                        <ThemeSelector lng={locale} />
                                        <FontSelector />
                                    </div>

                                    {/* Logout Area - Now inside Settings */}
                                    <div className="pt-8 flex flex-col items-center gap-4 border-t border-slate-50">
                                        <button className="w-full py-5 text-center text-rose-500 font-black text-xs uppercase tracking-[0.3em] bg-slate-50 rounded-[2rem] border border-slate-100 hover:bg-rose-50 transition-all active:scale-[0.98]">
                                            {t('logout')}
                                        </button>
                                        <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">DM App v2.0 • India 2026</p>
                                    </div>

                                    <AnimatePresence>
                                        {feedback.type && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className={`p-4 rounded-2xl text-[11px] font-black uppercase tracking-tight text-center ${feedback.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}
                                            >
                                                {feedback.message}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}
