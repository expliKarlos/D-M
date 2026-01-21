'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Trophy, Flame, Star } from 'lucide-react';

export default function JuegosBoda() {
    const games = [
        { title: "Búsqueda del Tesoro", desc: "Encuentra los 5 objetos ocultos en el salón", points: 50, icon: <Star />, color: "bg-yellow-50 text-yellow-600 border-yellow-100" },
        { title: "El Mejor Selfie", desc: "Hazte un selfie con 5 personas de diferentes mesas", points: 30, icon: <Flame />, color: "bg-orange-50 text-orange-600 border-orange-100" },
        { title: "Trivia Express", desc: "¿Cuánto sabes sobre los novios?", points: 100, icon: <Gamepad2 />, color: "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100" },
    ];

    return (
        <div className="space-y-6 pb-20">
            {/* Header Card */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-md p-8 rounded-[2rem] border border-yellow-100 shadow-xl shadow-yellow-500/5 overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100/20 rounded-full blur-3xl -mr-10 -mt-10" />

                <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600 mb-4 relative z-10">
                    <Gamepad2 size={24} />
                </div>
                <h3 className="text-3xl font-fredoka text-slate-900 mb-2 relative z-10">Juegos y Desafíos</h3>
                <p className="text-slate-600 font-outfit leading-relaxed relative z-10">Diviértete participando en retos exclusivos y gana **LoveTokens** para canjear por premios.</p>
            </motion.div>

            {/* Game List */}
            <div className="space-y-4">
                {games.map((game, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-5 rounded-[1.5rem] border ${game.color} flex items-center gap-4 relative overflow-hidden group active:scale-[0.98] transition-all cursor-pointer shadow-sm hover:shadow-md`}
                    >
                        <div className="w-14 h-14 rounded-2xl bg-white/80 flex items-center justify-center shadow-sm relative z-10">
                            {React.cloneElement(game.icon as React.ReactElement<any>, { size: 28 })}
                        </div>

                        <div className="flex-1 relative z-10">
                            <h4 className="font-fredoka text-lg text-slate-900">{game.title}</h4>
                            <p className="text-xs font-outfit text-slate-500">{game.desc}</p>
                        </div>

                        <div className="text-right relative z-10">
                            <div className="flex items-center gap-1 text-[#F21B6A] font-bold">
                                <span className="text-sm font-fredoka">+{game.points}</span>
                                <Trophy size={14} />
                            </div>
                            <span className="text-[10px] font-outfit uppercase tracking-wider text-slate-400">Tokens</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Leaderboard Button */}
            <button className="w-full p-4 bg-slate-900 text-white rounded-2xl font-fredoka flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform">
                <Trophy size={20} className="text-yellow-400" />
                Ver Ranking en Directo
            </button>
        </div>
    );
}
