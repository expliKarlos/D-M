'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageIcon, Camera, Heart } from 'lucide-react';
import Image from 'next/image';
import UploadZone from './UploadZone';
import { supabase } from '@/lib/services/supabase';

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
    const [currentShots, setCurrentShots] = useState(0);
    const [activeTab, setActiveTab] = useState<'all' | 'moments'>('all');
    const [selectedMoment, setSelectedMoment] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const maxShots = 10;

    useEffect(() => {
        let id = localStorage.getItem('d-m-ui-uid');
        if (!id) {
            id = `u_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('d-m-ui-uid', id);
        }
        setUserId(id);
    }, []);

    // Load shots from localStorage
    useEffect(() => {
        const savedShots = localStorage.getItem('d-m-app-shots');
        if (savedShots) {
            const parsed = parseInt(savedShots, 10);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCurrentShots(prev => prev === 0 ? parsed : prev);
        }
    }, []);

    // Supabase Real-time listener for gallery images
    useEffect(() => {
        // Initial fetch
        const fetchImages = async () => {
            const { data, error } = await supabase
                .from('social_wall')
                .select('*')
                .eq('type', 'photo')
                .eq('approved', true)
                .order('timestamp', { ascending: false });

            if (error) {
                console.error('Error fetching images:', error);
                return;
            }

            const galleryImages: GalleryImage[] = (data as unknown as { id: string; content: string; timestamp: number; likes_count: number; liked_by: string[]; metadata: { category?: string } }[]).map((row) => ({
                id: row.id,
                url: row.content,
                timestamp: row.timestamp,
                category: row.metadata?.category || 'ceremonia',
                likes_count: row.likes_count || 0,
                liked_by: row.liked_by || [],
            }));

            // Merge local and DB images, sorted by timestamp
            const merged = [...galleryImages, ...LOCAL_TEST_IMAGES].sort((a, b) => b.timestamp - a.timestamp);
            setImages(merged);
        };

        fetchImages();

        // Subscribe to real-time changes
        const channel = supabase
            .channel('social_wall_photos')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'social_wall',
                    filter: 'type=eq.photo',
                },
                () => {
                    fetchImages(); // Refetch on any change
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleUploadSuccess = () => {
        // Increment shots count locally
        const nextShots = currentShots + 1;
        setCurrentShots(nextShots);
        localStorage.setItem('d-m-app-shots', nextShots.toString());
    };

    const handleToggleLike = async (imageId: string) => {
        // Simple UID for current user (persist in localStorage if not exists)
        let userId = localStorage.getItem('d-m-ui-uid');
        if (!userId) {
            userId = `u_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('d-m-ui-uid', userId);
        }

        const image = images.find(img => img.id === imageId);
        if (!image) return;

        const isLiked = image.liked_by.includes(userId);
        const newLikedBy = isLiked
            ? image.liked_by.filter(uid => uid !== userId)
            : [...image.liked_by, userId];
        const newLikesCount = isLiked ? image.likes_count - 1 : image.likes_count + 1;

        // Optimistic Update
        const previousImages = [...images];
        setImages(prev => prev.map(img =>
            img.id === imageId
                ? { ...img, likes_count: newLikesCount, liked_by: newLikedBy }
                : img
        ));

        // Skip DB update for local images
        if (imageId.startsWith('local-')) return;

        // Actual DB Update
        try {
            const { error } = await supabase
                .from('social_wall')
                .update({
                    likes_count: newLikesCount,
                    liked_by: newLikedBy
                })
                .eq('id', imageId);

            if (error) throw error;
        } catch (error) {
            console.error('Error updating like:', error);
            // Rollback on error
            setImages(previousImages);
        }
    };

    const totalImages = images.length;
    // Top 5 Liked images for slideshow
    const slideshowImages = [...images].sort((a, b) => b.likes_count - a.likes_count).slice(0, 5);
    const gridImages = images.filter(img => !slideshowImages.find(si => si.id === img.id));

    // Moments grouping
    const momentsData = CATEGORIES.map(cat => ({
        ...cat,
        images: images.filter(img => img.category === cat.id),
        cover: images.find(img => img.category === cat.id)?.url
    }));

    const filteredImages = selectedMoment
        ? images.filter(img => img.category === selectedMoment)
        : [];

    return (
        <div className="pb-24">
            {/* Sticky Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-fuchsia-50 px-4 pt-4 pb-3 space-y-4">
                {/* Capture Banner */}
                <UploadZone
                    variant="minimalist"
                    onUploadSuccess={handleUploadSuccess}
                    currentShots={currentShots}
                    maxShots={maxShots}
                />

                {/* Sub-navigation Tabs */}
                <div className="flex gap-2 p-1 bg-slate-100/50 rounded-2xl">
                    <button
                        onClick={() => { setActiveTab('all'); setSelectedMoment(null); }}
                        className={`flex-1 h-10 rounded-xl font-fredoka text-sm transition-all duration-300 ${activeTab === 'all'
                            ? 'bg-gradient-to-r from-[#FF6B35] to-[#F21B6A] text-white shadow-lg shadow-fuchsia-500/20 scale-[1.02]'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Galería
                        <span className="ml-1.5 opacity-60 text-[10px] font-sans">({totalImages})</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('moments')}
                        className={`flex-1 h-10 rounded-xl font-fredoka text-sm transition-all duration-300 ${activeTab === 'moments'
                            ? 'bg-gradient-to-r from-[#FF6B35] to-[#F21B6A] text-white shadow-lg shadow-fuchsia-500/20 scale-[1.02]'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Momentos
                        <span className="ml-1.5 opacity-60 text-[10px] font-sans text-xs">✨</span>
                    </button>
                </div>
            </header>

            {/* Gallery Content */}
            <div className="pt-6 space-y-10">
                {activeTab === 'all' ? (
                    <>
                        {totalImages === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center text-slate-300 gap-4">
                                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center border border-dashed border-slate-200">
                                    <ImageIcon size={40} />
                                </div>
                                <p className="font-outfit text-sm text-center px-8 text-slate-400 leading-relaxed">
                                    Aún no hay fotos reveladas.<br />¡Sé el primero en capturar un momento!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-10">
                                {/* Slideshow Section (MD3) */}
                                {slideshowImages.length > 0 && (
                                    <div className="relative overflow-hidden py-2">
                                        <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory px-[10%] gap-4">
                                            {slideshowImages.map((img) => (
                                                <motion.div
                                                    key={img.id}
                                                    layoutId={img.id}
                                                    className="min-w-[80vw] aspect-[4/5] relative snap-center rounded-[2.5rem] overflow-hidden shadow-2xl shadow-fuchsia-500/10 border border-white/20"
                                                >
                                                    <Image
                                                        src={img.url}
                                                        alt="Destacado"
                                                        fill
                                                        priority
                                                        className="object-cover"
                                                        sizes="80vw"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                                                    {/* Like Button */}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleToggleLike(img.id); }}
                                                        className="absolute top-6 right-6 z-10"
                                                    >
                                                        <motion.div
                                                            whileTap={{ scale: 1.5 }}
                                                            animate={img.liked_by.includes(userId || '') ? { scale: [1, 1.2, 1] } : {}}
                                                            transition={{ duration: 0.3 }}
                                                            className={`p-3 rounded-full backdrop-blur-md border shadow-lg transition-colors ${img.liked_by.includes(userId || '')
                                                                ? 'bg-red-500 border-red-400 text-white'
                                                                : 'bg-white/20 border-white/30 text-white'
                                                                }`}
                                                        >
                                                            <Heart size={20} fill={img.liked_by.includes(userId || '') ? "currentColor" : "none"} />
                                                        </motion.div>
                                                    </button>

                                                    <div className="absolute bottom-6 left-6 flex items-center gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white">
                                                                <Camera size={14} />
                                                            </div>
                                                            <span className="text-[10px] text-white/90 font-outfit font-medium">
                                                                {new Date(img.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                                                            <Heart size={10} className="text-red-400" fill="currentColor" />
                                                            <span className="text-[10px] text-white font-bold">{img.likes_count}</span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Adaptive Mosaic Grid */}
                                <div className="px-4">
                                    <div className="grid grid-cols-2 md:grid-cols-3 grid-flow-dense gap-3">
                                        <AnimatePresence mode="popLayout">
                                            {gridImages.map((img, i) => {
                                                const isLarge = i % 7 === 0;
                                                const isWide = i % 11 === 0;
                                                const isTall = i % 13 === 0;

                                                return (
                                                    <motion.div
                                                        key={img.id}
                                                        layoutId={img.id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.02 }}
                                                        className={`relative rounded-3xl overflow-hidden shadow-sm border border-slate-100 group bg-white
                                                            ${isLarge ? 'col-span-2 row-span-2 aspect-square' : ''}
                                                            ${isWide && !isLarge ? 'col-span-2 aspect-[2/1]' : ''}
                                                            ${isTall && !isLarge && !isWide ? 'row-span-2 aspect-[1/2]' : ''}
                                                            ${!isLarge && !isWide && !isTall ? 'aspect-square' : ''}
                                                        `}
                                                    >
                                                        <Image
                                                            src={img.url}
                                                            alt="Gallery"
                                                            fill
                                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                            sizes={isLarge ? "66vw" : "33vw"}
                                                        />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

                                                        {/* Heart overlay for Grid */}
                                                        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                                                            <Heart size={10} className={img.liked_by.includes(userId || '') ? "text-red-500" : "text-white/60"} fill={img.liked_by.includes(userId || '') ? "currentColor" : "none"} />
                                                            <span className="text-[10px] text-white font-medium">{img.likes_count}</span>
                                                        </div>

                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleToggleLike(img.id); }}
                                                            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <motion.div
                                                                whileTap={{ scale: 1.4 }}
                                                                className={`p-2 rounded-full backdrop-blur-md border shadow-lg ${img.liked_by.includes(userId || '')
                                                                    ? 'bg-red-500 border-red-400 text-white'
                                                                    : 'bg-white/40 border-white/30 text-white'
                                                                    }`}
                                                            >
                                                                <Heart size={14} fill={img.liked_by.includes(userId || '') ? "currentColor" : "none"} />
                                                            </motion.div>
                                                        </button>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {!selectedMoment ? (
                            <div className="grid grid-cols-2 gap-4">
                                {momentsData.map((moment) => (
                                    <motion.button
                                        key={moment.id}
                                        onClick={() => setSelectedMoment(moment.id)}
                                        layoutId={`folder-${moment.id}`}
                                        className="relative aspect-[3/4] rounded-[2rem] overflow-hidden group shadow-lg border border-white"
                                    >
                                        {moment.cover ? (
                                            <Image
                                                src={moment.cover}
                                                alt={moment.name}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-slate-300">
                                                <ImageIcon size={32} />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                        <div className="absolute inset-0 flex flex-col justify-end p-5 text-left">
                                            <span className="text-2xl mb-1">{moment.icon}</span>
                                            <h4 className="font-fredoka text-white text-lg leading-none">{moment.name}</h4>
                                            <p className="font-outfit text-white/60 text-[10px] mt-1 uppercase tracking-wider">
                                                {moment.images.length} fotos
                                            </p>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between pb-2">
                                    <button
                                        onClick={() => setSelectedMoment(null)}
                                        className="text-slate-400 hover:text-slate-900 transition-colors font-outfit text-xs flex items-center gap-1.5"
                                    >
                                        ← Volver a Momentos
                                    </button>
                                    <h4 className="font-fredoka text-slate-900 capitalize flex items-center gap-2">
                                        <span>{CATEGORIES.find(c => c.id === selectedMoment)?.icon}</span>
                                        {selectedMoment}
                                    </h4>
                                </div>

                                {filteredImages.length === 0 ? (
                                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 px-10 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-200 shadow-sm">
                                            <Camera size={40} />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-fredoka text-slate-900">Aún no hay fotos de este momento</h4>
                                            <p className="font-outfit text-xs text-slate-500 leading-relaxed">
                                                ¡Sé el primero en capturar algo especial durante la {selectedMoment}!
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 grid-flow-dense gap-3">
                                        <AnimatePresence mode="popLayout">
                                            {filteredImages.map((img, i) => {
                                                const isLarge = i === 0; // Highlight the first one
                                                return (
                                                    <motion.div
                                                        key={img.id}
                                                        layoutId={img.id}
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className={`relative rounded-3xl overflow-hidden shadow-sm border border-slate-100 group bg-white
                                                            ${isLarge ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'}
                                                        `}
                                                    >
                                                        <Image
                                                            src={img.url}
                                                            alt="Filtered"
                                                            fill
                                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                        />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

                                                        {/* Heart overlay for Filtered Grid */}
                                                        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                                                            <Heart size={10} className={img.liked_by.includes(userId || '') ? "text-red-500" : "text-white/60"} fill={img.liked_by.includes(userId || '') ? "currentColor" : "none"} />
                                                            <span className="text-[10px] text-white font-medium">{img.likes_count}</span>
                                                        </div>

                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleToggleLike(img.id); }}
                                                            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <motion.div
                                                                whileTap={{ scale: 1.4 }}
                                                                className={`p-2 rounded-full backdrop-blur-md border shadow-lg ${img.liked_by.includes(userId || '')
                                                                        ? 'bg-red-500 border-red-400 text-white'
                                                                        : 'bg-white/40 border-white/30 text-white'
                                                                    }`}
                                                            >
                                                                <Heart size={14} fill={img.liked_by.includes(userId || '') ? "currentColor" : "none"} />
                                                            </motion.div>
                                                        </button>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Info Card */}
                <div className="px-4 pb-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="bg-slate-900 p-8 rounded-[3rem] text-white relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-40 h-40 bg-[#FF6B35]/20 blur-[80px] rounded-full group-hover:bg-[#F21B6A]/30 transition-colors duration-1000" />

                        <div className="relative z-10 space-y-4">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-[#FF6B35]">
                                <Camera size={24} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-fredoka text-lg">Carrete Limitado</h4>
                                <p className="text-xs font-outfit text-slate-400 leading-relaxed">
                                    Como en las bodas de antes, tu carrete es limitado ({maxShots} fotos). Elige tus disparos con sabiduría para capturar lo más especial.
                                </p>
                            </div>
                            <div className="pt-2 flex items-center gap-3">
                                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#FF6B35] to-[#F21B6A]"
                                        style={{ width: `${(currentShots / maxShots) * 100}%` }}
                                    />
                                </div>
                                <span className="text-[10px] font-bold font-outfit uppercase">{currentShots} / {maxShots}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
