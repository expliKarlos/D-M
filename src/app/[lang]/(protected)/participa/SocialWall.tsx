'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/services/firebase';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import Image from 'next/image';
import SmartImage from '@/components/shared/SmartImage';
import { Plus, Send, X } from 'lucide-react';

interface WallItem {
    id: string;
    type: 'text' | 'photo';
    content: string;
    author: string;
    timestamp: number;
    user_id: string;
}

const colors = [
    'bg-orange-50 border-orange-100 text-orange-800',
    'bg-fuchsia-50 border-fuchsia-100 text-fuchsia-800',
    'bg-yellow-50 border-yellow-100 text-yellow-800',
    'bg-blue-50 border-blue-100 text-blue-800',
    'bg-teal-50 border-teal-100 text-teal-800',
];

export default function SocialWall() {
    const [items, setItems] = useState<WallItem[]>([]);
    const [isWriting, setIsWriting] = useState(false);
    const [newText, setNewText] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, 'photos'),
            orderBy('timestamp', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const wallItems: WallItem[] = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    type: 'photo',
                    content: data.url || data.content || data.imageUrl,
                    author: data.author || 'Invitado',
                    timestamp: data.timestamp,
                    user_id: data.authorId || 'anonymous',
                };
            });
            setItems(wallItems);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching wall items:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleAddText = async () => {
        if (!newText.trim()) return;

        try {
            await addDoc(collection(db, 'photos'), {
                type: 'text',
                content: newText,
                author: authorName || 'Invitado',
                authorId: 'anonymous',
                timestamp: Date.now(),
                approved: true
            });

            setNewText('');
            setAuthorName('');
            setIsWriting(false);
        } catch (error) {
            console.error('Error adding to social wall:', error);
        }
    };

    if (loading) {
        return (
            <div className="h-40 flex items-center justify-center font-fredoka text-fuchsia-300 animate-pulse">
                Sincronizando Muro...
            </div>
        );
    }

    return (
        <div className="relative min-h-[60vh] pb-32">
            {/* Masonry Layout */}
            <div className="columns-2 sm:columns-3 gap-4 space-y-4 px-1">
                <AnimatePresence mode="popLayout">
                    {items.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className={`break-inside-avoid rounded-[2rem] border shadow-sm transition-all duration-300 hover:shadow-md mb-4 overflow-hidden relative group ${item.type === 'text'
                                ? `${colors[idx % colors.length]} p-6 border-white/50`
                                : 'bg-white border-slate-100 p-2'
                                }`}
                        >
                            {item.type === 'photo' ? (
                                <div className="space-y-3">
                                    <div className="aspect-square relative rounded-[1.5rem] overflow-hidden bg-slate-50">
                                        <SmartImage
                                            src={item.content || (item as any).url}
                                            alt="Social Wall Photo"
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 640px) 45vw, 30vw"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 px-2 pb-1">
                                        <div className="w-5 h-5 rounded-full bg-fuchsia-100 flex items-center justify-center text-[8px] font-bold text-[#F21B6A]">
                                            {item.author[0]}
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500 font-outfit truncate">{item.author}</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p className="font-outfit text-sm leading-relaxed italic mb-4">&quot;{item.content}&quot;</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-white/40 flex items-center justify-center text-[8px] font-bold">
                                            {item.author[0]}
                                        </div>
                                        <span className="text-[10px] font-bold opacity-60 font-outfit truncate uppercase tracking-wider">{item.author}</span>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* FAB */}
            <button
                onClick={() => setIsWriting(true)}
                className="fixed bottom-28 right-6 w-14 h-14 bg-gradient-to-r from-[#FF6B35] to-[#F21B6A] rounded-full shadow-2xl flex items-center justify-center text-white active:scale-90 transition-transform z-50"
            >
                <Plus size={28} />
            </button>

            {/* Write Overlay */}
            <AnimatePresence>
                {isWriting && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsWriting(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ y: 50, scale: 0.9 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.9 }} className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl relative z-10 p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-fredoka text-slate-900">Muro Social</h3>
                                <button onClick={() => setIsWriting(false)} className="text-slate-400"><X size={24} /></button>
                            </div>
                            <textarea
                                value={newText}
                                onChange={(e) => setNewText(e.target.value)}
                                placeholder="Comparte un mensaje con los novios..."
                                className="w-full h-32 bg-fuchsia-50/50 border-none rounded-3xl p-5 font-outfit text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-[#F21B6A]/20 resize-none"
                            />
                            <input
                                type="text"
                                value={authorName}
                                onChange={(e) => setAuthorName(e.target.value)}
                                placeholder="Tu nombre"
                                className="w-full bg-fuchsia-50/50 border-none rounded-2xl px-5 py-3 font-outfit text-slate-700"
                            />
                            <button
                                onClick={handleAddText}
                                disabled={!newText.trim()}
                                className="w-full bg-gradient-to-r from-[#FF6B35] to-[#F21B6A] text-white py-4 rounded-2xl font-fredoka text-lg shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Send size={20} /> Publicar
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
