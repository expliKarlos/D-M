'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Coins, Zap, Heart, Flame } from 'lucide-react';
import { useGamificationStore } from '@/lib/store/gamification-store';

export default function MisDatos() {
    const { loveTokens, badges } = useGamificationStore();

    return (
        <div className="py-6 space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-cinzel font-bold text-slate-900 mb-1">Tu Perfil</h2>
                    <p className="text-slate-500 text-sm italic tracking-wide">Nivel: Explorador Imperial</p>
                </div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-saffron to-teal p-0.5 shadow-lg">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-cinzel font-bold text-xl text-primary">
                        DY
                    </div>
                </div>
            </header>

            {/* LoveTokens Wallet with Floating Coins */}
            <section className="relative overflow-hidden bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Coins size={120} className="rotate-12" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <Heart className="text-rose-500 fill-rose-500" size={16} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">LoveTokens Wallet</span>
                    </div>

                    <div className="flex items-end gap-3">
                        <motion.span
                            key={loveTokens}
                            initial={{ scale: 1.5, color: '#f59e0b' }}
                            animate={{ scale: 1, color: '#0f172a' }}
                            className="text-6xl font-cinzel font-bold"
                        >
                            {loveTokens}
                        </motion.span>
                        <div className="flex flex-col mb-2">
                            <span className="text-xs font-bold text-saffron uppercase">Disponibles</span>
                            <div className="flex gap-1">
                                {[1, 2, 3].map((i) => (
                                    <motion.div
                                        key={i}
                                        animate={{
                                            y: [0, -10, 0],
                                            opacity: [0.4, 1, 0.4]
                                        }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 2,
                                            delay: i * 0.4
                                        }}
                                        className="w-3 h-3 rounded-full bg-saffron shadow-sm"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <button className="mt-8 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
                        <Zap size={18} className="text-saffron" />
                        Canjear Recompensas
                    </button>
                </div>
            </section>

            {/* House Progress: Team Fiesta vs Culture Explorer */}
            <section className="bg-slate-50 rounded-[2.5rem] p-8">
                <h3 className="text-lg font-cinzel font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Trophy size={20} className="text-primary" />
                    Progreso de Casa
                </h3>

                <div className="space-y-6">
                    {/* Team Fiesta */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                            <span className="flex items-center gap-2 text-rose-500">
                                <Flame size={14} /> Equipo Fiesta
                            </span>
                            <span className="text-slate-400">75%</span>
                        </div>
                        <div className="h-3 bg-white rounded-full overflow-hidden border border-slate-100">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '75%' }}
                                className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full"
                            />
                        </div>
                    </div>

                    {/* Culture Explorer */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider">
                            <span className="flex items-center gap-2 text-teal">
                                <Zap size={14} /> Cultura & Rituales
                            </span>
                            <span className="text-slate-400">40%</span>
                        </div>
                        <div className="h-3 bg-white rounded-full overflow-hidden border border-slate-100">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '40%' }}
                                className="h-full bg-gradient-to-r from-teal to-emerald-500 rounded-full"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8 p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div className="flex -space-x-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold ${i === 4 ? 'bg-primary text-white' : ''}`}>
                                {i === 4 ? '+12' : 'U'}
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium">16 amigos en tu "Casa"</p>
                </div>
            </section>

            {/* Badges Grid (Quick view) */}
            <section>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-cinzel font-bold text-slate-800">Insignias</h3>
                    <span className="text-xs font-bold text-primary">{badges.length} Ganadas</span>
                </div>
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`aspect-square rounded-2xl flex items-center justify-center border-2 ${badges[i - 1] ? 'border-primary/20 bg-primary/5' : 'border-dashed border-slate-200 bg-slate-50 opacity-50'}`}>
                            <Trophy size={20} className={badges[i - 1] ? 'text-primary' : 'text-slate-300'} />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
