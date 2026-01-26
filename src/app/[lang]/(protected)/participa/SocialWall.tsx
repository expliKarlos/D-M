'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/services/firebase';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import SmartImage from '@/components/shared/SmartImage';
import { Plus, Send, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { detectLanguage, getSmartTranslation } from '@/lib/actions/social-actions';

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
                    type: data.type || 'photo',
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

    const t = useTranslations('Social');

    if (loading) {
        return (
            <div className="h-40 flex items-center justify-center font-fredoka text-fuchsia-300 animate-pulse">
                {t('syncing')}
            </div>
        );
    }

    return (
        <div className="relative min-h-[60vh] pb-32">
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
                                            src={item.content}
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
                                <TextItemContent item={item} />
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <button
                onClick={() => setIsWriting(true)}
                className="fixed bottom-28 right-6 w-14 h-14 bg-gradient-to-r from-[#FF6B35] to-[#F21B6A] rounded-full shadow-2xl flex items-center justify-center text-white active:scale-90 transition-transform z-50"
            >
                <Plus size={28} />
            </button>

            <AnimatePresence>
                {isWriting && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsWriting(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                        <motion.div initial={{ y: 50, scale: 0.9 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.9 }} className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl relative z-10 p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-fredoka text-slate-900">{t('title')}</h3>
                                <button onClick={() => setIsWriting(false)} className="text-slate-400"><X size={24} /></button>
                            </div>
                            <textarea
                                value={newText}
                                onChange={(e) => setNewText(e.target.value)}
                                placeholder={t('message_placeholder')}
                                className="w-full h-32 bg-fuchsia-50/50 border-none rounded-3xl p-5 font-outfit text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-[#F21B6A]/20 resize-none"
                            />
                            <input
                                type="text"
                                value={authorName}
                                onChange={(e) => setAuthorName(e.target.value)}
                                placeholder={t('author_placeholder')}
                                className="w-full bg-fuchsia-50/50 border-none rounded-2xl px-5 py-3 font-outfit text-slate-700"
                            />
                            <button
                                onClick={handleAddText}
                                disabled={!newText.trim()}
                                className="w-full bg-gradient-to-r from-[#FF6B35] to-[#F21B6A] text-white py-4 rounded-2xl font-fredoka text-lg shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <Send size={20} /> {t('publish_button')}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function TextItemContent({ item }: { item: WallItem }) {
    const [translatedText, setTranslatedText] = useState<string | null>(null);
    const [isTranslating, setIsTranslating] = useState(false);
    const [showOriginal, setShowOriginal] = useState(true);
    const [detectedLang, setDetectedLang] = useState<string | null>(null);
    const [isDetecting, setIsDetecting] = useState(true);

    const locale = useLocale();
    const st = useTranslations('Social');

    useEffect(() => {
        const checkLanguage = async () => {
            // Heurística rápida para Hindi
            if (/[\u0900-\u097F]/.test(item.content)) {
                setDetectedLang('hi');
                setIsDetecting(false);
                return;
            }

            // Detección IA para ES/EN
            try {
                const result = await detectLanguage(item.content);
                if (result.success) setDetectedLang(result.language || null);
            } catch (e) {
                console.error('Detection error', e);
            } finally {
                setIsDetecting(false);
            }
        };

        checkLanguage();
    }, [item.content]);

    const handleTranslate = async () => {
        if (translatedText) {
            setShowOriginal(!showOriginal);
            return;
        }

        setIsTranslating(true);
        const result = await getSmartTranslation(item.content, locale);
        if (result.success && result.translation) {
            setTranslatedText(result.translation);
            setShowOriginal(false);
        }
        setIsTranslating(false);
    };

    const needsTranslation = detectedLang && detectedLang !== locale;

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1">
                <AnimatePresence mode="wait">
                    {showOriginal ? (
                        <motion.p
                            key="original"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="font-outfit text-sm leading-relaxed italic mb-4"
                        >
                            &quot;{item.content}&quot;
                        </motion.p>
                    ) : (
                        <motion.div
                            key="translated"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-4"
                        >
                            <p className="font-outfit text-sm leading-relaxed italic text-fuchsia-900/80">
                                &quot;{translatedText}&quot;
                            </p>
                            <div className="mt-2 text-[8px] font-bold uppercase tracking-widest text-fuchsia-400 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-fuchsia-300" />
                                {st('ai_tag')}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-white/40 flex items-center justify-center text-[8px] font-bold">
                        {item.author[0]}
                    </div>
                    <span className="text-[10px] font-bold opacity-60 font-outfit truncate uppercase tracking-wider">{item.author}</span>
                </div>

                {!isDetecting && needsTranslation && (
                    <button
                        onClick={handleTranslate}
                        disabled={isTranslating}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/40 transition-all duration-300 text-[9px] font-bold shadow-sm"
                    >
                        {isTranslating ? (
                            <span className="w-2 h-2 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <span className="material-symbols-outlined text-[12px]">translate</span>
                        )}
                        {isTranslating ? st('translating') : (showOriginal ? st('translate') : st('original'))}
                    </button>
                )}
            </div>
        </div>
    );
}
