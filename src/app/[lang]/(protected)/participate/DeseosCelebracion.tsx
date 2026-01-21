'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Send } from 'lucide-react';

export default function DeseosCelebracion() {
    return (
        <div className="space-y-6 pb-20">
            {/* Header Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-md p-8 rounded-[2rem] border border-orange-100 shadow-xl shadow-orange-500/5"
            >
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-[#FF6B35] mb-4">
                    <Sparkles size={24} />
                </div>
                <h3 className="text-3xl font-fredoka text-slate-900 mb-2">Muro de Deseos</h3>
                <p className="text-slate-600 font-outfit leading-relaxed">Deja tus mejores deseos para Digvijay y María. ¡Tus palabras formarán parte de nuestro recuerdo eterno!</p>
            </motion.div>

            {/* Input Section */}
            <div className="bg-white p-4 rounded-[2rem] border border-fuchsia-50 shadow-lg flex gap-3 items-center sticky top-24 z-10">
                <input
                    type="text"
                    placeholder="Escribe algo bonito..."
                    className="flex-1 bg-fuchsia-50/50 border-none rounded-2xl px-5 py-3 font-outfit text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-[#F21B6A]/20"
                />
                <button className="bg-[#F21B6A] text-white p-3.5 rounded-2xl shadow-lg shadow-fuchsia-500/20 active:scale-95 transition-transform">
                    <Send size={20} />
                </button>
            </div>

            {/* Wishes Feed */}
            <div className="grid grid-cols-1 gap-4">
                {[
                    { text: "¡Que vuestra vida juntos sea tan colorida como el festival de Holi!", author: "Familia García", color: "from-orange-50 to-orange-100/50" },
                    { text: "Sois una pareja increíble. ¡Muchísimas felicidades!", author: "Sanjay Kumar", color: "from-fuchsia-50 to-fuchsia-100/50" },
                    { text: "¡Deseando veros celebrar la unión de dos culturas tan bonitas!", author: "Elena & Marc", color: "from-yellow-50 to-yellow-100/50" },
                ].map((wish, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-6 bg-gradient-to-br ${wish.color} rounded-[1.5rem] border border-white/80 shadow-sm`}
                    >
                        <p className="text-lg font-outfit text-slate-800 leading-relaxed italic">"{wish.text}"</p>
                        <div className="flex items-center gap-2 mt-4">
                            <div className="w-6 h-6 rounded-full bg-white/50 border border-white flex items-center justify-center text-[10px] font-bold text-[#F21B6A]">
                                {wish.author[0]}
                            </div>
                            <span className="text-sm font-bold text-slate-500 font-outfit">{wish.author}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
