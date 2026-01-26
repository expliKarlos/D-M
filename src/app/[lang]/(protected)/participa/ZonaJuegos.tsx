'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Trophy, Star, Lock, Users, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';

const ShimmerBadge = () => {
    const t = useTranslations('Participation.games');
    return (
        <div className="relative overflow-hidden bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10">
                {t('upcoming')}
            </span>
            <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-12 z-0"
            />
        </div>
    );
};

interface GameCard {
    title: string;
    desc: string;
    icon: React.ReactNode;
    isLocked: boolean;
    color: string;
    tag: string;
    players?: string;
}

export default function ZonaJuegos() {
    const t = useTranslations('Participation.games');
    const games: GameCard[] = [
        {
            title: t('trivia.title'),
            desc: t('trivia.desc'),
            icon: <Star />,
            isLocked: false,
            color: "bg-orange-50 text-orange-600 border-orange-100 shadow-orange-500/5",
            tag: t('active_tag')
        },
        {
            title: t('who_is_who.title'),
            desc: t('who_is_who.desc'),
            icon: <Users />,
            isLocked: true,
            color: "bg-slate-50 text-slate-400 border-slate-100 grayscale-[0.5]",
            tag: "Nivel 2"
        },
        {
            title: t('bingo.title'),
            desc: t('bingo.desc'),
            icon: <MapPin />,
            isLocked: true,
            color: "bg-slate-50 text-slate-400 border-slate-100 grayscale-[0.5]",
            tag: "Sangeet Night"
        }
    ];

    return (
        <div className="space-y-8 pb-24 px-2 pt-4">
            {/* Header / Stats */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#F21B6A]/20 blur-[60px] -mr-10 -mt-10" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#FF6B35]/20 blur-[50px] -ml-10 -mb-10" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-yellow-400 border border-white/20">
                            <Trophy size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#F21B6A]">{t('lobby_title')}</p>
                            <h3 className="text-2xl font-fredoka">{t('tokens_title')}</h3>
                        </div>
                    </div>

                    <div className="flex items-end gap-2">
                        <span className="text-5xl font-fredoka font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">1,250</span>
                        <span className="text-yellow-400 font-fredoka text-lg mb-1.5 leading-none">LT</span>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                                    {String.fromCharCode(64 + i)}
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] font-outfit text-white/50 uppercase tracking-widest">
                            {t('players_online', { count: 42 })}
                        </p>
                    </div>
                </div>
            </div>

            {/* List of games */}
            <div className="space-y-4">
                <h4 className="text-lg font-fredoka text-slate-900 px-2">{t('challenges_title')}</h4>
                {games.map((game, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-5 rounded-[2rem] border relative overflow-hidden group transition-all duration-300 ${game.color} ${game.isLocked ? '' : 'active:scale-[0.98] cursor-pointer hover:shadow-lg'}`}
                    >
                        {/* Shimmer / Locked Overlay */}
                        {game.isLocked && (
                            <div className="absolute top-4 right-4 z-20">
                                <ShimmerBadge />
                            </div>
                        )}

                        <div className="flex items-start gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm relative z-10 ${game.isLocked ? 'bg-white/50' : 'bg-white'}`}>
                                {game.isLocked ? <Lock size={20} className="text-slate-300" /> : React.cloneElement(game.icon as React.ReactElement<any>, { size: 28 })}
                            </div>

                            <div className="flex-1 pr-12 relative z-10">
                                <div className="flex items-center gap-2 mb-1">
                                    <h5 className="font-fredoka text-lg tracking-tight text-slate-900">{game.title}</h5>
                                    {!game.isLocked && (
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    )}
                                </div>
                                <p className="text-xs font-outfit text-slate-500 leading-relaxed font-medium">
                                    {game.desc}
                                </p>
                            </div>
                        </div>

                        {/* Tag Bottom */}
                        <div className="mt-6 flex items-center justify-between px-1 relative z-10">
                            <div className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${game.isLocked ? 'bg-slate-300' : 'bg-orange-400'}`} />
                                <span className="text-[10px] font-bold font-fredoka uppercase tracking-widest opacity-60">
                                    {game.tag}
                                </span>
                            </div>
                            {!game.isLocked && (
                                <button className="px-4 py-1.5 bg-[#F21B6A] text-white rounded-xl text-[10px] font-bold font-fredoka tracking-widest active:scale-95 transition-transform shadow-md shadow-fuchsia-500/20 uppercase">
                                    {t('play_now')}
                                </button>
                            )}
                        </div>

                        {/* Decorative Background Icon for unlocked card */}
                        {!game.isLocked && (
                            <div className="absolute -bottom-4 -right-4 opacity-[0.03] rotate-12">
                                {React.cloneElement(game.icon as React.ReactElement<any>, { size: 100 })}
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-[#FF6B35] to-[#F21B6A] shadow-xl text-white relative overflow-hidden">
                <div className="w-full relative z-10">
                    <h5 className="font-fredoka text-xl mb-1">{t('rewards_title')}</h5>
                    <p className="text-xs font-outfit text-white/80">{t('rewards_desc')}</p>
                    <button className="mt-4 w-full bg-white text-[#F21B6A] py-3 rounded-2xl font-fredoka text-sm active:scale-95 transition-transform font-bold tracking-widest uppercase">
                        {t('explore_prizes')}
                    </button>
                </div>
                <div className="absolute top-0 right-0 p-8 rotate-12 scale-150 opacity-10">
                    <Trophy size={80} />
                </div>
            </div>
        </div>
    );
}
