'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CalendarClock, PhoneOutgoing, Activity, Car, Smartphone, WifiOff } from 'lucide-react';
import { useTranslations } from 'next-intl';

const VACCINES_KEYS = [
    { key: 'hepatitis_a', status: 'Imprescindible' },
    { key: 'typhoid', status: 'Recomendada' },
    { key: 'tetanus', status: 'Actualizar' },
];

const TRANSPORTS = [
    { name: 'Uber', type: 'App Global', icon: <Smartphone size={18} /> },
    { name: 'Ola', type: 'App Local', icon: <Car size={18} /> },
    { name: 'Metro', type: 'Megalópolis', icon: <Activity size={18} /> },
];

// Offline-First Logic: simple persistence for demo, simulating CacheStorage behavior
const OFFLINE_KEY = 'dm-planning-util-cache';

export default function InfoUtil() {
    const t = useTranslations('InfoHub.logistics');
    const [isOffline, setIsOffline] = useState(false);
    const [cachedData, setCachedData] = useState<any>(null);

    const translatedVaccines = VACCINES_KEYS.map(v => ({
        name: t(`vaccine_names.${v.key}`),
        desc: t(`vaccine_desc.${v.key}`),
        status: t(`vaccine_status.${v.status === 'Imprescindible' ? 'essential' : v.status === 'Recomendada' ? 'recommended' : 'update'}`)
    }));

    const translatedTransports = TRANSPORTS.map(tr => ({
        ...tr,
        type: t(`transport_types.${tr.type === 'App Global' ? 'global' : tr.type === 'App Local' ? 'local' : 'metro'}`)
    }));

    useEffect(() => {
        // Check network status
        const updateStatus = () => setIsOffline(!navigator.onLine);
        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);
        updateStatus();

        // Offline-First Storage Implementation
        const dataToCache = {
            insurance: '+34 911 234 567',
            visaRef: 'EVISA-2026-IND-8821',
            lastUpdate: new Date().toISOString()
        };

        // Store in LocalStorage (simulating CacheStorage for simplicity in this React component context)
        localStorage.setItem(OFFLINE_KEY, JSON.stringify(dataToCache));
        setCachedData(dataToCache);

        return () => {
            window.removeEventListener('online', updateStatus);
            window.removeEventListener('offline', updateStatus);
        };
    }, []);

    const handleSOS = () => {
        const phone = cachedData?.insurance || '+34 911 234 567';
        window.location.href = `tel:${phone.replace(/\s/g, '')}`;
    };

    return (
        <div className="py-6 space-y-8">
            {isOffline && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="bg-slate-800 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest overflow-hidden"
                >
                    <WifiOff size={14} className="text-rose-400" />
                    {t('offline_alert')}
                </motion.div>
            )}

            <header>
                <h2 className="text-3xl font-cinzel font-bold text-slate-900 mb-6">{t('title')}</h2>
            </header>

            {/* HeaderStatus Indicators */}
            <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-white/40 backdrop-blur-md border border-white/60 shadow-sm flex flex-col items-center text-center gap-2">
                    <ShieldCheck className="text-emerald-500" size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-600">{t('passport')}</span>
                    <span className="text-[9px] text-emerald-700 font-medium"> {t('passport_valid')}</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/40 backdrop-blur-md border border-white/60 shadow-sm flex flex-col items-center text-center gap-2">
                    <CalendarClock className="text-amber-500" size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-600">{t('visa')}</span>
                    <span className="text-[9px] text-amber-700 font-medium">{cachedData?.visaRef ? t('visa_valid') : t('visa_pending')}</span>
                </div>
                <button
                    onClick={handleSOS}
                    className="p-4 rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-200 flex flex-col items-center text-center gap-2 active:scale-95 transition-transform"
                >
                    <PhoneOutgoing size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">{t('insurance')}</span>
                    <span className="text-[10px] font-bold">{t('sos_button')}</span>
                </button>
            </div>

            {/* Transport Section */}
            <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -mr-10 -mt-10" />
                <h3 className="text-xl font-cinzel font-bold mb-6 flex items-center gap-2">
                    <Car size={20} className="text-saffron" />
                    {t('transports')}
                </h3>
                <div className="space-y-4">
                    {translatedTransports.map((t_item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                    {t_item.icon}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">{t_item.name}</h4>
                                    <p className="text-[10px] text-slate-400">{t_item.type}</p>
                                </div>
                            </div>
                            <button
                                disabled={isOffline && t_item.name !== 'Metro'}
                                className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border ${isOffline && t_item.name !== 'Metro'
                                    ? 'border-slate-700 text-slate-600 opacity-50'
                                    : 'border-saffron/30 text-saffron'
                                    }`}
                            >
                                {isOffline && t_item.name !== 'Metro' ? t('online') : t('open')}
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Vaccines Section */}
            <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                <h3 className="text-xl font-cinzel font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Activity size={20} className="text-teal" />
                    {t('health')}
                </h3>
                <div className="grid grid-cols-1 gap-4">
                    {translatedVaccines.map((v, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-teal/5 border border-teal/10">
                            <div className="w-2 h-2 rounded-full bg-teal" />
                            <div className="flex-1">
                                <h4 className="font-bold text-sm text-slate-800">{v.name}</h4>
                                <p className="text-[10px] text-slate-500">{v.desc}</p>
                            </div>
                            <span className="text-[10px] font-bold px-3 py-1 bg-white rounded-full text-teal-700 shadow-sm border border-teal/10">
                                {v.status}
                            </span>
                        </div>
                    ))}
                </div>
                {isOffline && (
                    <p className="mt-6 text-[9px] text-center text-slate-400 font-bold uppercase tracking-[0.2em]">
                        {t('offline_storage')}
                    </p>
                )}
            </section>
        </div>
    );
}
