'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Send, X, Camera, Heart, ImageIcon, Loader2 } from 'lucide-react';
import { db } from '@/lib/services/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { logEvent } from '@/lib/services/analytics-logger';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { detectLanguage, getSmartTranslation } from '@/lib/actions/social-actions';

interface Wish {
    id: string;
    text: string;
    imageUrl?: string;
    authorName: string;
    colorCard: string;
    likesCount: number;
    liked_by: string[];
    timestamp: number;
    rotation: number;
}

const HOLI_PALETTE = [
    { bg: 'bg-[#FFF9F2]', border: 'border-orange-100', text: 'text-orange-900', accent: '#FF9933', name: 'Saffron' },
    { bg: 'bg-[#FFF0F6]', border: 'border-fuchsia-100', text: 'text-fuchsia-900', accent: '#F21B6A', name: 'Pink' },
    { bg: 'bg-[#F0F7FF]', border: 'border-blue-100', text: 'text-blue-900', accent: '#3B82F6', name: 'Blue' },
    { bg: 'bg-[#F0FFF4]', border: 'border-teal-100', text: 'text-teal-900', accent: '#10B981', name: 'Teal' },
    { bg: 'bg-[#FFFFF0]', border: 'border-yellow-100', text: 'text-yellow-900', accent: '#F59E0B', name: 'Yellow' },
];

export default function MuroDeseos() {
    const t = useTranslations('Social');
    const [wishes, setWishes] = useState<Wish[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [modalType, setModalType] = useState<'text' | 'image' | null>(null);
    const [newText, setNewText] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        let id = localStorage.getItem('d-m-ui-uid');
        if (!id) {
            id = `u_${Math.random().toString(36).substring(2, 11)}`;
            localStorage.setItem('d-m-ui-uid', id);
        }
        setUserId(id);
    }, []);

    useEffect(() => {
        const q = query(collection(db, 'wishes'), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const wishesData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    rotation: data.rotation ?? (Math.random() * 10 - 5)
                } as Wish;
            });
            setWishes(wishesData);
        });
        return () => unsubscribe();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handlePublish = async () => {
        if (!newText.trim() && !selectedFile) return;
        setUploading(true);

        try {
            let imageUrl = '';
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                formData.append('folder', 'participation-wishes');
                formData.append('bucket', 'photos');

                const uploadResponse = await fetch('/api/upload-wish-image', {
                    method: 'POST',
                    body: formData
                });

                if (!uploadResponse.ok) {
                    const errorData = await uploadResponse.json();
                    throw new Error(errorData.error || 'Failed to upload image');
                }

                const { url } = await uploadResponse.json();
                imageUrl = url;
            }

            const colorIndex = Math.floor(Math.random() * HOLI_PALETTE.length);
            const rotation = Math.random() * 10 - 5;

            await addDoc(collection(db, 'wishes'), {
                text: newText,
                imageUrl,
                authorName: authorName || t('anonymous'),
                colorCard: colorIndex.toString(),
                likesCount: 0,
                liked_by: [],
                timestamp: Date.now(),
                rotation
            });

            await logEvent('wish_created', {
                hasImage: !!imageUrl,
                textLength: newText.length,
                authorProvided: !!authorName,
            });

            setNewText('');
            setAuthorName('');
            setSelectedFile(null);
            setPreviewUrl(null);
            setModalType(null);
            setIsMenuOpen(false);
        } catch (error) {
            console.error('Error publishing wish:', error);
            alert(`${t('error_upload')}: ${error instanceof Error ? error.message : 'Error unknown'}`);
        } finally {
            setUploading(false);
        }
    };

    const handleToggleLike = async (wishId: string, isLiked: boolean) => {
        if (!userId) return;
        const wishRef = doc(db, 'wishes', wishId);
        await updateDoc(wishRef, {
            likesCount: increment(isLiked ? -1 : 1),
            liked_by: isLiked ? arrayRemove(userId) : arrayUnion(userId)
        });
    };

    return (
        <div className="relative min-h-screen pb-40 overflow-hidden bg-[#FAF9F6]">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply"
                style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/handmade-paper.png')` }} />

            <div className="p-4 sm:p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                <AnimatePresence mode="popLayout">
                    {wishes.map((wish) => {
                        const style = HOLI_PALETTE[parseInt(wish.colorCard, 10) || 0];
                        const isLiked = wish.liked_by.includes(userId || '');

                        return (
                            <motion.div
                                key={wish.id}
                                layoutId={wish.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1, rotate: wish.rotation }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                className={`relative ${style.bg} ${style.border} border-2 rounded-2xl shadow-lg p-3 sm:p-4 flex flex-col gap-3 group hover:z-10 transition-shadow hover:shadow-2xl`}
                                style={{ transformOrigin: 'top center' }}
                            >
                                {wish.imageUrl && (
                                    <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-white shadow-inner mb-2 border border-black/5 p-1">
                                        <div className="relative w-full h-full rounded-md overflow-hidden">
                                            <Image src={wish.imageUrl} alt="Wish" fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                                        </div>
                                    </div>
                                )}

                                <WishCardContent wish={wish} style={style} />

                                <div className="flex items-center justify-between mt-auto pt-3 border-t border-black/5">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white`} style={{ backgroundColor: style.accent }}>
                                            {wish.authorName[0].toUpperCase()}
                                        </div>
                                        <span className="text-[10px] font-bold opacity-50 uppercase tracking-tighter truncate max-w-[60px]">
                                            {wish.authorName}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => handleToggleLike(wish.id, isLiked)}
                                        className="flex items-center gap-1 group/heart"
                                    >
                                        <motion.div whileTap={{ scale: 2 }} className={isLiked ? "text-red-500" : "text-slate-300"}>
                                            <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
                                        </motion.div>
                                        <span className="text-[10px] font-bold opacity-40">{wish.likesCount}</span>
                                    </button>
                                </div>
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full shadow-sm bg-slate-300/50" />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            <div className="fixed bottom-28 right-6 z-50 flex flex-col items-end gap-3">
                <AnimatePresence>
                    {isMenuOpen && (
                        <>
                            <motion.button
                                initial={{ opacity: 0, y: 20, scale: 0 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0 }}
                                onClick={() => setModalType('image')}
                                className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-xl border border-fuchsia-50 group hover:bg-fuchsia-50 transition-colors"
                            >
                                <span className="text-sm font-bold text-slate-700">{t('photo_wish')}</span>
                                <div className="p-2 bg-orange-100 text-orange-600 rounded-xl"><Camera size={18} /></div>
                            </motion.button>
                            <motion.button
                                initial={{ opacity: 0, y: 20, scale: 0 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0 }}
                                onClick={() => setModalType('text')}
                                className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-xl border border-fuchsia-50 group hover:bg-fuchsia-50 transition-colors"
                            >
                                <span className="text-sm font-bold text-slate-700">{t('text_wish')}</span>
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><Send size={18} /></div>
                            </motion.button>
                        </>
                    )}
                </AnimatePresence>

                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-all duration-300 ${isMenuOpen ? 'bg-slate-800 rotate-45' : 'bg-gradient-to-tr from-[#FF6B35] to-[#F21B6A]'}`}
                >
                    <Plus size={32} />
                </button>
            </div>

            <AnimatePresence>
                {modalType && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !uploading && setModalType(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div initial={{ y: 50, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 50, opacity: 0, scale: 0.9 }} className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                            <div className="p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-fredoka text-slate-900">{modalType === 'image' ? t('photo_wish_title') : t('text_wish_title')}</h3>
                                    <button onClick={() => setModalType(null)} disabled={uploading} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
                                </div>

                                {modalType === 'image' && (
                                    <div onClick={() => fileInputRef.current?.click()} className="relative aspect-video w-full rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-fuchsia-300 transition-colors">
                                        {previewUrl ? <Image src={previewUrl} alt="Preview" fill className="object-cover" /> : <><Camera className="text-slate-400 mb-2" size={32} /><span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('select_photo')}</span></>}
                                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <textarea value={newText} onChange={(e) => setNewText(e.target.value)} placeholder={t('message_placeholder')} className="w-full h-32 bg-slate-50 border-none rounded-3xl p-5 font-outfit text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-[#F21B6A]/10 resize-none" />
                                    <input type="text" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder={t('author_placeholder')} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-outfit text-slate-800 focus:ring-2 focus:ring-[#F21B6A]/10" />
                                </div>

                                <button onClick={handlePublish} disabled={uploading || (!newText.trim() && !selectedFile)} className={`w-full h-16 rounded-2xl flex items-center justify-center gap-3 text-white font-fredoka text-xl shadow-lg transition-all active:scale-95 ${uploading ? 'bg-slate-400' : 'bg-gradient-to-r from-[#FF6B35] to-[#F21B6A]'}`}>
                                    {uploading ? <Loader2 className="animate-spin" size={24} /> : <><Send size={20} /><span>{t('publish_button')}</span></>}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function WishCardContent({ wish, style }: { wish: Wish, style: any }) {
    const [translatedText, setTranslatedText] = useState<string | null>(null);
    const [isTranslating, setIsTranslating] = useState(false);
    const [showOriginal, setShowOriginal] = useState(true);
    const [detectedLang, setDetectedLang] = useState<string | null>(null);
    const [isDetecting, setIsDetecting] = useState(true);

    const locale = useLocale();
    const st = useTranslations('Social');

    useEffect(() => {
        const checkLanguage = async () => {
            if (/[\u0900-\u097F]/.test(wish.text)) {
                setDetectedLang('hi');
                setIsDetecting(false);
                return;
            }
            try {
                const res = await detectLanguage(wish.text);
                if (res.success) setDetectedLang(res.language || null);
            } catch (e) {
                console.error(e);
            } finally {
                setIsDetecting(false);
            }
        };
        checkLanguage();
    }, [wish.text]);

    const handleTranslate = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (translatedText) {
            setShowOriginal(!showOriginal);
            return;
        }
        setIsTranslating(true);
        const result = await getSmartTranslation(wish.text, locale);
        if (result.success && result.translation) {
            setTranslatedText(result.translation);
            setShowOriginal(false);
        }
        setIsTranslating(false);
    };

    const needsTranslation = detectedLang && detectedLang !== locale;

    return (
        <div className="space-y-3">
            <AnimatePresence mode="wait">
                {showOriginal ? (
                    <motion.p key="original" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`font-outfit text-sm sm:text-base ${style.text} leading-relaxed font-medium italic`}>&quot;{wish.text}&quot;</motion.p>
                ) : (
                    <motion.div key="translated" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                        <p className={`font-outfit text-sm sm:text-base ${style.text} leading-relaxed font-medium italic opacity-80`}>&quot;{translatedText}&quot;</p>
                        <div className="flex items-center gap-1.5 py-1 px-2 bg-white/40 rounded-lg w-fit"><span className="text-[7px] font-bold uppercase tracking-widest opacity-60">{st('ai_tag')}</span></div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isDetecting && needsTranslation && (
                <button onClick={handleTranslate} disabled={isTranslating} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/5 hover:bg-black/10 transition-all text-[9px] font-bold text-slate-600 shadow-sm active:scale-95">
                    {isTranslating ? <Loader2 className="animate-spin" size={10} /> : <span className="material-symbols-outlined text-[12px]">translate</span>}
                    {isTranslating ? st('translating') : (showOriginal ? st('translate') : st('original'))}
                </button>
            )}
        </div>
    );
}
