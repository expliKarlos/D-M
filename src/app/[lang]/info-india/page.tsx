'use client';

import React, { useEffect, useState } from 'react';
import { InfoCardData } from '@/lib/services/planning-concierge';
import InfoCard from '@/components/shared/InfoCard';
import { motion } from 'framer-motion';

export default function InfoIndiaPage() {
    const [info, setInfo] = useState<InfoCardData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/planning/info-india')
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
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-icons-outlined text-3xl text-primary">temple_hindu</span>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Protocolo India</h1>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">
                    Consejos esenciales para sumergirte en la cultura local con respeto y confianza.
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
                className="mt-12 p-6 bg-white rounded-2xl border border-slate-100 text-center"
            >
                <p className="text-xs text-slate-400 italic">
                    Información sintetizada por D&M Concierge basada en el protocolo oficial del evento.
                </p>
            </motion.div>
        </main>
    );
}
