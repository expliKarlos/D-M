'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { InfoCardData } from '@/lib/services/planning-concierge';

export default function InfoCard({ data }: { data: InfoCardData }) {
    const priorityColors = {
        high: 'border-red-500 bg-red-50/50',
        medium: 'border-orange-500 bg-orange-50/50',
        low: 'border-emerald-500 bg-emerald-50/50'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className={`p-5 rounded-2xl border-l-4 shadow-sm backdrop-blur-sm transition-all ${priorityColors[data.priority]}`}
        >
            <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-xl shrink-0">
                    <span className="material-icons-outlined text-primary">{data.icon || 'star'}</span>
                </div>
                <div>
                    <h4 className="font-bold text-slate-800 mb-1 leading-tight">{data.title}</h4>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-2 block">{data.category}</span>
                    <p className="text-sm text-slate-600 leading-relaxed">{data.content}</p>
                </div>
            </div>

            {data.priority === 'high' && (
                <div className="mt-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-tighter italic">Importante</span>
                </div>
            )}
        </motion.div>
    );
}
