'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Send, X } from 'lucide-react';

interface Wish {
    id: string;
    text: string;
    author: string;
    color: string;
}

const colors = [
    'bg-orange-50 border-orange-100 text-orange-800',
    'bg-fuchsia-50 border-fuchsia-100 text-fuchsia-800',
    'bg-yellow-50 border-yellow-100 text-yellow-800',
    'bg-blue-50 border-blue-100 text-blue-800',
    'bg-teal-50 border-teal-100 text-teal-800',
];

export default function MuroDeseos() {
    const [wishes, setWishes] = useState<Wish[]>([
        { id: '1', text: '¡Que vuestra vida juntos sea tan colorida como el festival de Holi! 🌈', author: 'Familia García', color: colors[0] },
        { id: '2', text: 'Sois una pareja increíble. ¡Muchísimas felicidades!', author: 'Sanjay Kumar', color: colors[1] },
        { id: '3', text: 'Un brindis por el amor sin fronteras. ¡Disfutadlo!', author: 'Elena & Marc', color: colors[2] },
        { id: '4', text: 'Namasté a esta nueva aventura juntos. 🙏', author: 'Anika & Arjun', color: colors[3] },
        { id: '5', text: '¡Que nunca falten los colores en vuestro camino!', author: 'Lorena Ramos', color: colors[4] },
    ]);

    const [isWriting, setIsWriting] = useState(false);
    const [newWish, setNewWish] = useState('');
    const [authorName, setAuthorName] = useState('');

    const handleAddWish = () => {
        if (!newWish.trim()) return;
        const wish: Wish = {
            id: Math.random().toString(36).substring(7),
            text: newWish,
            author: authorName || 'Invitado',
            color: colors[Math.floor(Math.random() * colors.length)],
        };
        setWishes([wish, ...wishes]);
        setNewWish('');
        setAuthorName('');
        setIsWriting(false);
    };

    return (
        <div className="relative min-h-[60vh] pb-24 px-4 pt-4 overflow-visible">
            {/* Masonry Layout via CSS Columns */}
            <div className="columns-2 sm:columns-3 gap-4 space-y-4">
                <AnimatePresence mode="popLayout">
                    {wishes.map((wish) => (
                        <motion.div
                            key={wish.id}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className={`break-inside-avoid p-5 rounded-3xl border shadow-sm ${wish.color} flex flex-col gap-3 relative group transition-all duration-300 hover:rotate-1 hover:shadow-md cursor-default mb-4`}
                        >
                            <p className="font-outfit text-[15px] leading-relaxed italic">
                                "{wish.text}"
                            </p>
                            <div className="flex items-center gap-2 mt-auto">
                                <div className="w-5 h-5 rounded-full bg-white/40 border border-white/20 flex items-center justify-center text-[8px] font-bold">
                                    {wish.author[0]}
                                </div>
                                <span className="text-[11px] font-bold opacity-70 font-outfit truncate uppercase tracking-wider">
                                    {wish.author}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Floating Action Button */}
            <button
                onClick={() => setIsWriting(true)}
                className="fixed bottom-28 right-6 w-14 h-14 bg-gradient-to-r from-[#FF6B35] to-[#F21B6A] rounded-full shadow-2xl flex items-center justify-center text-white active:scale-90 transition-transform z-50 hover:shadow-fuchsia-500/20 group"
            >
                <Plus size={28} className="transition-transform group-hover:rotate-90" />
            </button>

            {/* Write Wish Overlay */}
            <AnimatePresence>
                {isWriting && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsWriting(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: 50, scale: 0.9, opacity: 0 }}
                            animate={{ y: 0, scale: 1, opacity: 1 }}
                            exit={{ y: 50, scale: 0.9, opacity: 0 }}
                            className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-fuchsia-50"
                        >
                            <div className="p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-fredoka text-slate-900">Escribe tu Deseo</h3>
                                    <button onClick={() => setIsWriting(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>

                                <textarea
                                    value={newWish}
                                    onChange={(e) => setNewWish(e.target.value)}
                                    placeholder="¡Vuestro deseo aquí! 🎉"
                                    className="w-full h-32 bg-fuchsia-50/50 border-none rounded-[1.5rem] p-5 font-outfit text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-[#F21B6A]/20 resize-none"
                                />

                                <input
                                    type="text"
                                    value={authorName}
                                    onChange={(e) => setAuthorName(e.target.value)}
                                    placeholder="Tu nombre (opcional)"
                                    className="w-full bg-fuchsia-50/50 border-none rounded-2xl px-5 py-3 font-outfit text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-[#F21B6A]/20"
                                />

                                <button
                                    onClick={handleAddWish}
                                    disabled={!newWish.trim()}
                                    className="w-full bg-gradient-to-r from-[#FF6B35] to-[#F21B6A] text-white py-4 rounded-2xl font-fredoka text-lg shadow-lg shadow-fuchsia-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
                                >
                                    <Send size={20} />
                                    Publicar Mensaje
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
