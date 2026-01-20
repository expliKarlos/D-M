'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGamificationStore } from '@/lib/store/gamification-store';
import { Award, Coins, ShieldCheck } from 'lucide-react';

export default function ProfileStats() {
    const { loveTokens, badges } = useGamificationStore();

    return (
        <div className="flex flex-col gap-8">
            {/* Love Tokens Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-primary to-primary-dark p-6 rounded-3xl shadow-lg relative overflow-hidden"
            >
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <p className="text-white/70 text-sm font-medium uppercase tracking-widest mb-1">Balance Actual</p>
                        <h2 className="text-4xl font-black text-white flex items-center gap-3">
                            {loveTokens}
                            <span className="text-xl font-bold text-white/50">LT</span>
                        </h2>
                    </div>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                        <Coins size={32} className="text-white" />
                    </div>
                </div>
                {/* Decorative circles */}
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-white/5 rounded-full blur-xl" />
            </motion.div>

            {/* Badges Section */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 px-2">Mis Insignias</h3>
                <div className="grid grid-cols-2 gap-4">
                    {badges.length > 0 ? (
                        badges.map((badgeId) => (
                            <motion.div
                                key={badgeId}
                                whileHover={{ scale: 1.05 }}
                                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center gap-2"
                            >
                                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
                                    <Award size={24} />
                                </div>
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-tighter">
                                    {badgeId === 'info-explorer' ? 'Explorador India' : badgeId}
                                </span>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-2 p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                            <p className="text-sm text-slate-400">Aún no has ganado insignias. ¡Explora la Info Útil para empezar!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Antigravity Badge Status */}
            <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-indigo-500 shadow-sm shrink-0">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-indigo-900 leading-tight">Estado Antigravity</h4>
                    <p className="text-[11px] text-indigo-700 leading-tight mt-1">
                        Tu perfil cuenta con protección 'Antigravity' activa gracias a tu compromiso con el evento.
                    </p>
                </div>
            </div>
        </div>
    );
}
