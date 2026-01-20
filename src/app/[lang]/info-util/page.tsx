'use client';

import React, { useEffect, useState } from 'react';
import { InfoCardData } from '@/lib/services/planning-concierge';
import InfoCard from '@/components/shared/InfoCard';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useGamificationStore } from '@/lib/store/gamification-store';

export default function InfoUtilPage() {
    const [info, setInfo] = useState<InfoCardData[]>([]);
    const [loading, setLoading] = useState(true);
    const hasBadge = useGamificationStore(state => state.hasClaimedInfoUtilBadge);
    const readCount = useGamificationStore(state => state.readItems.length);

    useEffect(() => {
        fetch('/api/planning/info-util')
            .then(res => res.json())
            .then(data => {
                setInfo(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    // Trigger confetti if the badge was just claimed
    useEffect(() => {
        if (hasBadge && !loading && info.length > 0) {
            // Only trigger if we actually have items and reached 100%
            // In a more robust implementation, we'd check against a specific category
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#ee6c2b', '#3b82f6', '#10b981']
            });
        }
    }, [hasBadge, loading, info.length]);

    return (
        <main className="min-h-screen bg-background-light px-6 pt-12 pb-32">
            <header className="mb-10 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-icons-outlined text-3xl text-blue-500">fact_check</span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Información Útil</h1>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">
                    Todo lo que necesitas saber antes de despegar: Visados, Salud y Transporte.
                </p>
                {!loading && (
                    <div className="mt-4 bg-slate-100 rounded-full h-2 w-32 mx-auto overflow-hidden">
                        <div
                            className="bg-primary h-full transition-all duration-1000"
                            style={{ width: `${(Math.min(readCount, info.length) / info.length) * 100}%` }}
                        />
                    </div>
                )}
            </header>

            {loading ? (
                <div className="flex flex-col gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-full h-32 bg-slate-200 animate-pulse rounded-2xl" />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {info.map((item, index) => (
                        <InfoCard key={item.id || index} data={item} totalItems={info.length} />
                    ))}
                </div>
            )}

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-12 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center gap-4"
            >
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                    <span className="material-icons-outlined text-blue-500">support_agent</span>
                </div>
                <p className="text-[11px] text-blue-700 leading-tight">
                    Recuerda que esta información está sujeta a cambios. Consulta siempre con fuentes oficiales.
                </p>
            </motion.div>
        </main>
    );
}
