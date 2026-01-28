'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageIcon, Camera, Heart, X, Download, Users } from 'lucide-react';
import Image from 'next/image';
import SmartImage from '@/components/shared/SmartImage';
import UploadZone from './UploadZone';
import { db } from '@/lib/services/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { logEvent } from '@/lib/services/analytics-logger';
import { cn } from '@/lib/utils';
import { useGallery, GalleryImage, Moment } from '@/lib/contexts/GalleryContext';
import { useTranslations } from 'next-intl';
import { countPendingUploads } from '@/lib/services/offline-storage';

export default function GaleriaFotos() {
    const { images, moments, isLoading } = useGallery();
    const [currentShots, setCurrentShots] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('d-m-app-shots');
            return saved ? parseInt(saved, 10) : 0;
        }
        return 0;
    });
    const [activeTab, setActiveTab] = useState<'all' | 'moments'>('all');
    const [selectedMoment, setSelectedMoment] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            let id = localStorage.getItem('d-m-ui-uid');
            if (!id) {
                id = `u_${Math.random().toString(36).substring(2, 11)}`;
                localStorage.setItem('d-m-ui-uid', id);
            }
            return id;
        }
        return null;
    });
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
    const maxShots = 10;

    // Pending Uploads State
    const [pendingCount, setPendingCount] = useState(0);

    // Poll for pending uploads (simple sync status check)
    useEffect(() => {
        const checkPending = async () => {
            try {
                const count = await countPendingUploads();
                setPendingCount(count);
            } catch (e) {
                console.error("Failed to count pending uploads", e);
            }
        };

        checkPending(); // Initial check
        const interval = setInterval(checkPending, 5000); // Check every 5s

        return () => clearInterval(interval);
    }, []);

    const handleUploadSuccess = (url: string, fileSize?: number, fileType?: string) => {
        const nextShots = currentShots + 1;
        setCurrentShots(nextShots);
        localStorage.setItem('d-m-app-shots', nextShots.toString());

        // Log analytics event
        logEvent('photo_uploaded', {
            fileSize,
            fileType,
            shotNumber: nextShots,
        });
    };

    const handleToggleLike = async (imageId: string) => {
        if (!userId) return;
        const image = images.find(img => img.id === imageId);
        if (!image) return;

        const isLiked = image.liked_by.includes(userId);
        const newLikedBy = isLiked ? image.liked_by.filter(uid => uid !== userId) : [...image.liked_by, userId];
        const newLikesCount = isLiked ? Math.max(0, image.likes_count - 1) : image.likes_count + 1;

        // Note: For context-based state, normally we'd trigger a mutation in the context
        // But since we are using onSnapshot, the updateDoc below will trigger a real-time update
        // through the global listener, so optimistic UI here is still fine but optional.
        if (selectedImage?.id === imageId) {
            setSelectedImage(prev => prev ? { ...prev, likes_count: newLikesCount, liked_by: newLikedBy } : null);
        }

        try {
            const photoRef = doc(db, 'photos', imageId);
            await updateDoc(photoRef, {
                likesCount: increment(isLiked ? -1 : 1),
                liked_by: isLiked ? arrayRemove(userId) : arrayUnion(userId)
            });
        } catch (err) {
            console.error(err);
        }
    };

    const totalImages = images.length;

    // Memoized derived data for instant re-rendering
    const slideshowImages = useMemo(() =>
        [...images].sort((a, b) => b.likes_count - a.likes_count).slice(0, 5),
        [images]);

    const gridImages = useMemo(() =>
        images.filter((img: GalleryImage) => !slideshowImages.find((si: GalleryImage) => si.id === img.id)),
        [images, slideshowImages]);

    const filteredImages = useMemo(() =>
        selectedMoment ? images.filter((img: GalleryImage) => img.category === selectedMoment) : [],
        [images, selectedMoment]);

    // Virtual folders (Moments) data - Memoized for stability
    const momentsData = useMemo(() => moments.map(m => ({
        ...m,
        images: images.filter((img: GalleryImage) => img.category === m.id),
        cover: images.find((img: GalleryImage) => img.category === m.id)?.url
    })), [images, moments]);

    const t = useTranslations('Participation.gallery');

    if (isLoading && images.length === 0) {
        return <div className="min-h-screen bg-white flex items-center justify-center font-outfit text-slate-400">{t('preparing')}</div>;
    }

    return (
        <div className="min-h-screen bg-white flex flex-col pb-24 font-outfit">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-fuchsia-50 px-4 pt-4 pb-3 space-y-4">
                <UploadZone variant="minimalist" onUploadSuccess={handleUploadSuccess} currentShots={currentShots} maxShots={maxShots} moments={moments} />

                {pendingCount > 0 && (
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex items-center justify-between text-xs font-medium text-orange-700 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                            </span>
                            Wait for Wi-Fi: {pendingCount} high-res photos pending
                        </div>
                        <span className="opacity-60 text-[10px] uppercase tracking-wider">Queue</span>
                    </div>
                )}

                <div className="flex gap-2 p-1 bg-slate-100/50 rounded-2xl">
                    <button onClick={() => { setActiveTab('all'); setSelectedMoment(null); }} className={`flex-1 h-10 rounded-xl font-fredoka text-sm transition-all duration-300 ${activeTab === 'all' ? 'bg-gradient-to-r from-[#FF6B35] to-[#F21B6A] text-white shadow-lg' : 'text-slate-500'}`}>{t('tab_gallery')} ({totalImages})</button>
                    <button onClick={() => setActiveTab('moments')} className={`flex-1 h-10 rounded-xl font-fredoka text-sm transition-all duration-300 ${activeTab === 'moments' ? 'bg-gradient-to-r from-[#FF6B35] to-[#F21B6A] text-white shadow-lg' : 'text-slate-500'}`}>{t('tab_moments')}</button>
                </div>
            </header>

            <div className="pt-6 space-y-10">
                {activeTab === 'all' ? (
                    <div className="space-y-10">
                        {totalImages === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center text-slate-300 gap-4">
                                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center border border-dashed border-slate-200"><ImageIcon size={40} /></div>
                                <p className="font-outfit text-sm text-center px-8 text-slate-400">{t('empty')}</p>
                            </div>
                        ) : (
                            <>
                                {slideshowImages.length > 0 && (
                                    <div className="relative overflow-hidden py-2">
                                        <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory px-[10%] gap-4">
                                            {slideshowImages.map((img: GalleryImage) => (
                                                <SmartImage
                                                    key={img.id}
                                                    layoutId={img.url}
                                                    layout
                                                    src={img.url}
                                                    alt={t('images_count', { count: 1 })}
                                                    className="object-cover"
                                                    onClick={() => setSelectedImage(img)}
                                                    containerClassName="min-w-[80vw] aspect-[4/5] relative snap-center rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20 cursor-zoom-in"
                                                    sizes="80vw"
                                                    priority
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                                                    <button onClick={(e) => { e.stopPropagation(); handleToggleLike(img.id); }} className="absolute top-6 right-6 z-10">
                                                        <motion.div whileTap={{ scale: 1.5 }} className={`p-3 rounded-full backdrop-blur-md border shadow-lg ${img.liked_by.includes(userId || '') ? 'bg-red-500 text-white' : 'bg-white/20 text-white'}`}><Heart size={20} fill={img.liked_by.includes(userId || '') ? "currentColor" : "none"} /></motion.div>
                                                    </button>
                                                </SmartImage>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="px-4">
                                    <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] grid-flow-dense gap-3 auto-rows-[120px]">
                                        <AnimatePresence mode="popLayout">
                                            {gridImages.map((img: GalleryImage, i: number) => {
                                                const hasManyLikes = img.likes_count > 20;
                                                const spanClass = hasManyLikes ? "col-span-2 row-span-2" : i % 7 === 0 ? "col-span-2" : "";
                                                return (
                                                    <SmartImage
                                                        key={img.id}
                                                        layoutId={img.url}
                                                        layout
                                                        src={img.url}
                                                        alt={t('images_count', { count: 1 })}
                                                        onClick={() => setSelectedImage(img)}
                                                        containerClassName={cn("relative rounded-3xl overflow-hidden shadow-sm border border-slate-100 bg-white cursor-zoom-in group", spanClass)}
                                                        className="object-cover transition-transform group-hover:scale-105"
                                                        sizes="(max-width: 768px) 50vw, 33vw"
                                                    >
                                                        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/10 z-10 text-white text-[10px]">
                                                            <Heart size={10} className={img.liked_by.includes(userId || '') ? "text-red-500" : ""} fill={img.liked_by.includes(userId || '') ? "currentColor" : "none"} />
                                                            {img.likes_count}
                                                        </div>
                                                        <button onClick={(e) => { e.stopPropagation(); handleToggleLike(img.id); }} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                                            <div className={`p-2 rounded-full backdrop-blur-md border shadow-lg ${img.liked_by.includes(userId || '') ? 'bg-red-500 text-white' : 'bg-white/40 text-white'}`}><Heart size={14} fill={img.liked_by.includes(userId || '') ? "currentColor" : "none"} /></div>
                                                        </button>
                                                    </SmartImage>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Horizontal Scroll Header */}
                        <div className="px-4 sticky top-[138px] z-40 bg-white/60 backdrop-blur-md py-4 -mt-6">
                            <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-2">
                                <button
                                    onClick={() => setSelectedMoment(null)}
                                    className={cn(
                                        "flex-shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 border",
                                        !selectedMoment
                                            ? "bg-gradient-to-r from-[#FF6B35] to-[#F21B6A] text-white border-transparent shadow-[0_0_15px_rgba(242,27,106,0.4)] scale-105"
                                            : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
                                    )}
                                >
                                    {t('moment_all')} <span className="text-[10px] opacity-60 ml-1">({images.length})</span>
                                </button>
                                {moments.map((moment) => {
                                    const count = images.filter(img => img.category === moment.id).length;
                                    const isActive = selectedMoment === moment.id;
                                    return (
                                        <button
                                            key={moment.id}
                                            onClick={() => setSelectedMoment(moment.id)}
                                            className={cn(
                                                "flex-shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 border flex items-center gap-2",
                                                isActive
                                                    ? "bg-gradient-to-r from-[#FF6B35] to-[#F21B6A] text-white border-transparent shadow-[0_0_15px_rgba(242,27,106,0.4)] scale-105"
                                                    : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
                                            )}
                                        >
                                            <span>{moment.icon}</span>
                                            {moment.name}
                                            <span className="text-[10px] opacity-60">({count})</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Adaptive Photo Wall */}
                        <div className="px-4">
                            {(!selectedMoment && images.length === 0) ? (
                                <div className="py-20 flex flex-col items-center justify-center bg-slate-50 border border-dashed rounded-[3rem] text-slate-400 text-sm">
                                    <Camera size={40} className="mb-4" />
                                    {t('no_photos')}
                                </div>
                            ) : (
                                <div className={cn(
                                    "grid transition-all duration-700",
                                    !selectedMoment
                                        ? "grid-cols-4 md:grid-cols-5 gap-1" // Mass effect
                                        : "grid-cols-2 gap-4" // Detail effect
                                )}>
                                    <AnimatePresence mode="popLayout" initial={false}>
                                        {(selectedMoment ? filteredImages : images).map((img: GalleryImage) => (
                                            <SmartImage
                                                key={img.id}
                                                layoutId={img.url}
                                                layout
                                                transition={{
                                                    layout: { type: "spring", stiffness: 200, damping: 25 }
                                                }}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                src={img.url}
                                                alt={t('tab_moments')}
                                                onClick={() => setSelectedImage(img)}
                                                containerClassName={cn(
                                                    "relative overflow-hidden cursor-zoom-in group shadow-sm transition-all duration-500",
                                                    !selectedMoment ? "rounded-sm aspect-square" : "rounded-2xl aspect-square shadow-xl"
                                                )}
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                sizes={!selectedMoment ? "25vw" : "50vw"}
                                            >
                                                {selectedMoment && (
                                                    <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full text-white text-[8px] z-10 border border-white/10 shadow-sm pointer-events-none">
                                                        <Heart size={8} className={img.liked_by.includes(userId || '') ? "text-red-500" : ""} fill={img.liked_by.includes(userId || '') ? "currentColor" : "none"} />
                                                        {img.likes_count}
                                                    </div>
                                                )}
                                            </SmartImage>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="px-4 pb-12">
                    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} className="bg-slate-900 p-8 rounded-[3rem] text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/20 blur-[80px] rounded-full" />
                        <div className="relative z-10 space-y-4">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-orange-400"><Camera size={24} /></div>
                            <div>
                                <h4 className="font-fredoka text-lg">{t('limited_roll.title')}</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">{t('limited_roll.desc', { max: maxShots })}</p>
                            </div>
                            <div className="pt-2 flex items-center gap-3">
                                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-orange-500" style={{ width: `${(currentShots / maxShots) * 100}%` }} /></div>
                                <span className="text-[10px] font-bold">{currentShots} / {maxShots}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <AnimatePresence>
                {selectedImage && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col">
                        <div className="p-4 flex items-center justify-between text-white border-b border-white/10">
                            <button onClick={() => setSelectedImage(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
                            <div className="flex gap-2">
                                <button onClick={() => handleToggleLike(selectedImage.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${selectedImage.liked_by.includes(userId || '') ? 'bg-red-500 border-red-400' : 'bg-white/10 border-white/20'}`}><Heart size={18} fill={selectedImage.liked_by.includes(userId || '') ? "currentColor" : "none"} /><span className="text-sm font-bold">{selectedImage.likes_count}</span></button>
                                <a href={selectedImage.url} download target="_blank" rel="noreferrer" className="p-2 hover:bg-white/10 rounded-full border border-white/20"><Download size={24} /></a>
                            </div>
                        </div>
                        <div className="flex-1 relative flex items-center justify-center p-4">
                            <motion.div layoutId={selectedImage.id} className="relative w-full h-full"><SmartImage src={selectedImage.url} alt="Full" fill className="object-contain" priority unoptimized /></motion.div>
                        </div>
                        <div className="p-6 bg-gradient-to-t from-black space-y-4">
                            <div className="flex items-center gap-2 text-white/60"><Users size={16} /><span className="text-sm uppercase tracking-widest">{t('liked_by')}</span></div>
                            <div className="flex -space-x-2">
                                {selectedImage.liked_by.length > 0 ? selectedImage.liked_by.map((uid, idx) => (
                                    <div key={uid} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-black flex items-center justify-center text-[10px] text-white font-bold" style={{ zIndex: 10 - idx }}>{uid.slice(2, 4).toUpperCase()}</div>
                                )) : <span className="text-xs text-white/40 italic">{t('no_likes')}</span>}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
