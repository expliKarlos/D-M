'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageIcon, Camera, Heart, X, Download, Users } from 'lucide-react';
import Image from 'next/image';
import UploadZone from './UploadZone';
import { db } from '@/lib/services/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';

interface GalleryImage {
    id: string;
    url: string;
    timestamp: number;
    category?: string;
    likes_count: number;
    liked_by: string[];
}

const CATEGORIES = [
    { id: 'pedida', name: 'Pedida', icon: '💍', description: 'El gran "Sí"' },
    { id: 'ceremonia', name: 'Ceremonia', icon: '⛪', description: 'El enlace' },
    { id: 'banquete', name: 'Banquete', icon: '🥂', description: 'Celebración' },
    { id: 'fiesta', name: 'Fiesta', icon: '💃', description: '¡A bailar!' },
];

const LOCAL_TEST_IMAGES: GalleryImage[] = [
    { id: 'local-1', url: '/test-gallery/Foto01.png', timestamp: Date.now() - 1000 * 60 * 60, category: 'ceremonia', likes_count: 12, liked_by: [] },
    { id: 'local-2', url: '/test-gallery/Foto02.png', timestamp: Date.now() - 1000 * 60 * 120, category: 'fiesta', likes_count: 45, liked_by: [] },
    { id: 'local-3', url: '/test-gallery/Foto03.png', timestamp: Date.now() - 1000 * 60 * 180, category: 'banquete', likes_count: 5, liked_by: [] },
    { id: 'local-4', url: '/test-gallery/Foto04.png', timestamp: Date.now() - 1000 * 60 * 240, category: 'ceremonia', likes_count: 22, liked_by: [] },
    { id: 'local-5', url: '/test-gallery/Foto05.png', timestamp: Date.now() - 1000 * 60 * 300, category: 'pedida', likes_count: 89, liked_by: [] },
    { id: 'local-6', url: '/test-gallery/Foto06.jpeg', timestamp: Date.now() - 1000 * 60 * 360, category: 'ceremonia', likes_count: 15, liked_by: [] },
    { id: 'local-7', url: '/test-gallery/Foto07.png', timestamp: Date.now() - 1000 * 60 * 420, category: 'fiesta', likes_count: 3, liked_by: [] },
    { id: 'local-8', url: '/test-gallery/Foto08.jpeg', timestamp: Date.now() - 1000 * 60 * 480, category: 'banquete', likes_count: 10, liked_by: [] },
    { id: 'local-9', url: '/test-gallery/Foto09.jpeg', timestamp: Date.now() - 1000 * 60 * 540, category: 'pedida', likes_count: 7, liked_by: [] },
    { id: 'local-10', url: '/test-gallery/Foto10.png', timestamp: Date.now() - 1000 * 60 * 600, category: 'ceremonia', likes_count: 28, liked_by: [] },
    { id: 'local-11', url: '/test-gallery/Foto11.jpeg', timestamp: Date.now() - 1000 * 60 * 660, category: 'fiesta', likes_count: 14, liked_by: [] },
    { id: 'local-12', url: '/test-gallery/Foto12.jpeg', timestamp: Date.now() - 1000 * 60 * 720, category: 'banquete', likes_count: 9, liked_by: [] },
    { id: 'local-13', url: '/test-gallery/Foto13.jpeg', timestamp: Date.now() - 1000 * 60 * 780, category: 'ceremonia', likes_count: 31, liked_by: [] },
    { id: 'local-14', url: '/test-gallery/Foto14.jpeg', timestamp: Date.now() - 1000 * 60 * 840, category: 'fiesta', likes_count: 56, liked_by: [] },
    { id: 'local-15', url: '/test-gallery/Foto15.jpeg', timestamp: Date.now() - 1000 * 60 * 900, category: 'banquete', likes_count: 4, liked_by: [] },
    { id: 'local-16', url: '/test-gallery/Foto16.jpeg', timestamp: Date.now() - 1000 * 60 * 960, category: 'ceremonia', likes_count: 18, liked_by: [] },
    { id: 'local-17', url: '/test-gallery/Foto17.jpeg', timestamp: Date.now() - 1000 * 60 * 1020, category: 'fiesta', likes_count: 2, liked_by: [] },
];

export default function GaleriaFotos() {
    const [images, setImages] = useState<GalleryImage[]>([]);
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



    // Firestore Real-time listener for gallery images
    useEffect(() => {
        const q = query(
            collection(db, 'photos'),
            orderBy('timestamp', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const galleryImages: GalleryImage[] = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    url: data.url,
                    timestamp: data.timestamp,
                    category: data.moment?.toLowerCase() || 'ceremonia',
                    likes_count: data.likesCount || 0,
                    liked_by: data.liked_by || [],
                };
            });

            // Merge local and DB images, sorted by timestamp
            const merged = [...galleryImages, ...LOCAL_TEST_IMAGES].sort((a, b) => b.timestamp - a.timestamp);
            setImages(merged);
        }, (error) => {
            console.error('Error fetching images:', error);
        });

        return () => unsubscribe();
    }, []);

    const handleUploadSuccess = () => {
        const nextShots = currentShots + 1;
        setCurrentShots(nextShots);
        localStorage.setItem('d-m-app-shots', nextShots.toString());
    };

    const handleToggleLike = async (imageId: string) => {
        if (!userId) return;
        const image = images.find(img => img.id === imageId);
        if (!image) return;

        const isLiked = image.liked_by.includes(userId);
        const newLikedBy = isLiked ? image.liked_by.filter(uid => uid !== userId) : [...image.liked_by, userId];
        const newLikesCount = isLiked ? Math.max(0, image.likes_count - 1) : image.likes_count + 1;

        const previousImages = [...images];
        setImages(prev => prev.map(img => img.id === imageId ? { ...img, likes_count: newLikesCount, liked_by: newLikedBy } : img));
        if (selectedImage?.id === imageId) {
            setSelectedImage(prev => prev ? { ...prev, likes_count: newLikesCount, liked_by: newLikedBy } : null);
        }

        if (imageId.startsWith('local-')) return;

        try {
            const photoRef = doc(db, 'photos', imageId);
            await updateDoc(photoRef, {
                likesCount: increment(isLiked ? -1 : 1),
                liked_by: isLiked ? arrayRemove(userId) : arrayUnion(userId)
            });
        } catch (err) {
            console.error(err);
            setImages(previousImages);
        }
    };

    const totalImages = images.length;
    const slideshowImages = [...images].sort((a, b) => b.likes_count - a.likes_count).slice(0, 5);
    const gridImages = images.filter(img => !slideshowImages.find(si => si.id === img.id));
    const momentsData = CATEGORIES.map(cat => ({ ...cat, images: images.filter(img => img.category === cat.id), cover: images.find(img => img.category === cat.id)?.url }));
    const filteredImages = selectedMoment ? images.filter(img => img.category === selectedMoment) : [];

    return (
        <div className="min-h-screen bg-white flex flex-col pb-24 font-outfit">
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-fuchsia-50 px-4 pt-4 pb-3 space-y-4">
                <UploadZone variant="minimalist" onUploadSuccess={handleUploadSuccess} currentShots={currentShots} maxShots={maxShots} />
                <div className="flex gap-2 p-1 bg-slate-100/50 rounded-2xl">
                    <button onClick={() => { setActiveTab('all'); setSelectedMoment(null); }} className={`flex-1 h-10 rounded-xl font-fredoka text-sm transition-all duration-300 ${activeTab === 'all' ? 'bg-gradient-to-r from-[#FF6B35] to-[#F21B6A] text-white shadow-lg' : 'text-slate-500'}`}>Galería ({totalImages})</button>
                    <button onClick={() => setActiveTab('moments')} className={`flex-1 h-10 rounded-xl font-fredoka text-sm transition-all duration-300 ${activeTab === 'moments' ? 'bg-gradient-to-r from-[#FF6B35] to-[#F21B6A] text-white shadow-lg' : 'text-slate-500'}`}>Momentos ✨</button>
                </div>
            </header>

            <div className="pt-6 space-y-10">
                {activeTab === 'all' ? (
                    <div className="space-y-10">
                        {totalImages === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center text-slate-300 gap-4">
                                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center border border-dashed border-slate-200"><ImageIcon size={40} /></div>
                                <p className="font-outfit text-sm text-center px-8 text-slate-400">Aún no hay fotos reveladas.</p>
                            </div>
                        ) : (
                            <>
                                {slideshowImages.length > 0 && (
                                    <div className="relative overflow-hidden py-2">
                                        <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory px-[10%] gap-4">
                                            {slideshowImages.map((img) => (
                                                <motion.div key={img.id} layoutId={img.id} onClick={() => setSelectedImage(img)} className="min-w-[80vw] aspect-[4/5] relative snap-center rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20 cursor-zoom-in">
                                                    <Image src={img.url} alt="Destacado" fill priority className="object-cover" sizes="80vw" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                                    <button onClick={(e) => { e.stopPropagation(); handleToggleLike(img.id); }} className="absolute top-6 right-6 z-10">
                                                        <motion.div whileTap={{ scale: 1.5 }} className={`p-3 rounded-full backdrop-blur-md border shadow-lg ${img.liked_by.includes(userId || '') ? 'bg-red-500 text-white' : 'bg-white/20 text-white'}`}><Heart size={20} fill={img.liked_by.includes(userId || '') ? "currentColor" : "none"} /></motion.div>
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="px-4">
                                    <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] grid-flow-dense gap-3 auto-rows-[120px]">
                                        <AnimatePresence mode="popLayout">
                                            {gridImages.map((img, i) => {
                                                const hasManyLikes = img.likes_count > 20;
                                                const isVertical = img.url.toLowerCase().endsWith('.jpeg');
                                                const spanClass = hasManyLikes ? "col-span-2 row-span-2" : isVertical ? "row-span-2" : i % 7 === 0 ? "col-span-2" : "";
                                                return (
                                                    <motion.div key={img.id} layoutId={img.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} onClick={() => setSelectedImage(img)} className={`relative rounded-3xl overflow-hidden shadow-sm border border-slate-100 bg-white cursor-zoom-in group ${spanClass}`}>
                                                        <Image src={img.url} alt="Gallery" fill className="object-cover transition-transform group-hover:scale-105" sizes="(max-width: 768px) 50vw, 33vw" />
                                                        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/10 z-10 text-white text-[10px]">
                                                            <Heart size={10} className={img.liked_by.includes(userId || '') ? "text-red-500" : ""} fill={img.liked_by.includes(userId || '') ? "currentColor" : "none"} />
                                                            {img.likes_count}
                                                        </div>
                                                        <button onClick={(e) => { e.stopPropagation(); handleToggleLike(img.id); }} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                                            <div className={`p-2 rounded-full backdrop-blur-md border shadow-lg ${img.liked_by.includes(userId || '') ? 'bg-red-500 text-white' : 'bg-white/40 text-white'}`}><Heart size={14} fill={img.liked_by.includes(userId || '') ? "currentColor" : "none"} /></div>
                                                        </button>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="px-4 space-y-10">
                        {!selectedMoment ? (
                            <div className="grid grid-cols-2 gap-4">
                                {momentsData.map((moment) => (
                                    <motion.button key={moment.id} onClick={() => setSelectedMoment(moment.id)} layoutId={`folder-${moment.id}`} className="relative aspect-[3/4] rounded-[2rem] overflow-hidden group shadow-lg">
                                        {moment.cover ? <Image src={moment.cover} alt={moment.name} fill className="object-cover transition-transform group-hover:scale-110" /> : <div className="absolute inset-0 bg-slate-100 flex items-center justify-center"><ImageIcon size={32} /></div>}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                        <div className="absolute inset-0 flex flex-col justify-end p-5 text-left text-white">
                                            <span className="text-2xl">{moment.icon}</span>
                                            <h4 className="font-fredoka text-lg">{moment.name}</h4>
                                            <p className="text-[10px] opacity-60 uppercase">{moment.images.length} fotos</p>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <button onClick={() => setSelectedMoment(null)} className="text-slate-400 text-xs flex items-center gap-1.5">← Volver</button>
                                    <h4 className="font-fredoka text-slate-900 capitalize flex items-center gap-2"><span>{CATEGORIES.find(c => c.id === selectedMoment)?.icon}</span>{selectedMoment}</h4>
                                </div>
                                {filteredImages.length === 0 ? (
                                    <div className="py-20 flex flex-col items-center justify-center bg-slate-50 border border-dashed rounded-[3rem] text-slate-400 text-sm"><Camera size={40} className="mb-4" />Aún no hay fotos</div>
                                ) : (
                                    <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] grid-flow-dense gap-3 auto-rows-[120px]">
                                        <AnimatePresence mode="popLayout">
                                            {filteredImages.map((img) => (
                                                <motion.div key={img.id} layoutId={img.id} onClick={() => setSelectedImage(img)} className="relative rounded-3xl overflow-hidden shadow-sm border border-slate-100 group cursor-zoom-in">
                                                    <Image src={img.url} alt="Moment" fill className="object-cover transition-transform group-hover:scale-110" />
                                                    <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full text-white text-[10px]">
                                                        <Heart size={10} className={img.liked_by.includes(userId || '') ? "text-red-500" : ""} fill={img.liked_by.includes(userId || '') ? "currentColor" : "none"} />
                                                        {img.likes_count}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className="px-4 pb-12">
                    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} className="bg-slate-900 p-8 rounded-[3rem] text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/20 blur-[80px] rounded-full" />
                        <div className="relative z-10 space-y-4">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-orange-400"><Camera size={24} /></div>
                            <div>
                                <h4 className="font-fredoka text-lg">Carrete Limitado</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">Cada invitado tiene {maxShots} disparos. Úsalos con sabiduría.</p>
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
                            <motion.div layoutId={selectedImage.id} className="relative w-full h-full"><Image src={selectedImage.url} alt="Full" fill className="object-contain" priority unoptimized /></motion.div>
                        </div>
                        <div className="p-6 bg-gradient-to-t from-black space-y-4">
                            <div className="flex items-center gap-2 text-white/60"><Users size={16} /><span className="text-sm uppercase tracking-widest">Le gusta a</span></div>
                            <div className="flex -space-x-2">
                                {selectedImage.liked_by.length > 0 ? selectedImage.liked_by.map((uid, idx) => (
                                    <div key={uid} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-black flex items-center justify-center text-[10px] text-white font-bold" style={{ zIndex: 10 - idx }}>{uid.slice(2, 4).toUpperCase()}</div>
                                )) : <span className="text-xs text-white/40 italic">Nadie todavía...</span>}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
