'use client';

import React, { useEffect, useState } from 'react';
import { InfoCardData } from '@/lib/services/planning-concierge';
import InfoCard from '@/components/shared/InfoCard';
import { motion } from 'framer-motion';

export default function InfoUtilPage() {
    const [info, setInfo] = useState<InfoCardData[]>([]);
    const [loading, setLoading] = useState(true);

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
                        <InfoCard key={item.id || index} data={item} />
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
