'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageIcon, Camera, Maximize2 } from 'lucide-react';
import Image from 'next/image';
import UploadZone from './UploadZone';
import { supabase } from '@/lib/services/supabase';

interface GalleryImage {
    id: string;
    url: string;
    timestamp: number;
}

const LOCAL_TEST_IMAGES: GalleryImage[] = [
    { id: 'local-1', url: '/test-gallery/Foto01.png', timestamp: Date.now() - 1000 * 60 * 60 },
    { id: 'local-2', url: '/test-gallery/Foto02.png', timestamp: Date.now() - 1000 * 60 * 120 },
    { id: 'local-3', url: '/test-gallery/Foto03.png', timestamp: Date.now() - 1000 * 60 * 180 },
    { id: 'local-4', url: '/test-gallery/Foto04.png', timestamp: Date.now() - 1000 * 60 * 240 },
    { id: 'local-5', url: '/test-gallery/Foto05.png', timestamp: Date.now() - 1000 * 60 * 300 },
    { id: 'local-6', url: '/test-gallery/Foto06.jpeg', timestamp: Date.now() - 1000 * 60 * 360 },
    { id: 'local-7', url: '/test-gallery/Foto07.png', timestamp: Date.now() - 1000 * 60 * 420 },
    { id: 'local-8', url: '/test-gallery/Foto08.jpeg', timestamp: Date.now() - 1000 * 60 * 480 },
    { id: 'local-9', url: '/test-gallery/Foto09.jpeg', timestamp: Date.now() - 1000 * 60 * 540 },
    { id: 'local-10', url: '/test-gallery/Foto10.png', timestamp: Date.now() - 1000 * 60 * 600 },
    { id: 'local-11', url: '/test-gallery/Foto11.jpeg', timestamp: Date.now() - 1000 * 60 * 660 },
    { id: 'local-12', url: '/test-gallery/Foto12.jpeg', timestamp: Date.now() - 1000 * 60 * 720 },
    { id: 'local-13', url: '/test-gallery/Foto13.jpeg', timestamp: Date.now() - 1000 * 60 * 780 },
    { id: 'local-14', url: '/test-gallery/Foto14.jpeg', timestamp: Date.now() - 1000 * 60 * 840 },
    { id: 'local-15', url: '/test-gallery/Foto15.jpeg', timestamp: Date.now() - 1000 * 60 * 900 },
    { id: 'local-16', url: '/test-gallery/Foto16.jpeg', timestamp: Date.now() - 1000 * 60 * 960 },
    { id: 'local-17', url: '/test-gallery/Foto17.jpeg', timestamp: Date.now() - 1000 * 60 * 1020 },
];

export default function GaleriaFotos() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [currentShots, setCurrentShots] = useState(0);
    const [activeTab, setActiveTab] = useState<'all' | 'moments'>('all');
    const maxShots = 10;

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

            const galleryImages: GalleryImage[] = (data as { id: string; content: string; timestamp: number }[]).map((row) => ({
                id: row.id,
                url: row.content,
                timestamp: row.timestamp,
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

    const totalImages = images.length;
    const slideshowImages = images.slice(0, 5);
    const gridImages = images.slice(5);

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
                <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl">
                    <button
                        onClick={() => setActiveTab('all')}
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
                        <span className="ml-1.5 opacity-60 text-[10px] font-sans">IA</span>
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
                                                <div
                                                    key={img.id}
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
                                                    <div className="absolute bottom-6 left-6 flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white">
                                                            <Camera size={14} />
                                                        </div>
                                                        <span className="text-[10px] text-white/90 font-outfit font-medium">
                                                            {new Date(img.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Adaptive Mosaic Grid */}
                                <div className="px-4">
                                    <div className="grid grid-cols-2 md:grid-cols-3 grid-flow-dense gap-3">
                                        <AnimatePresence mode="popLayout">
                                            {gridImages.map((img, i) => {
                                                // Pattern for dynamic spans: 2x2, 2x1, 1x2 or 1x1
                                                const isLarge = i % 7 === 0;
                                                const isWide = i % 11 === 0;
                                                const isTall = i % 13 === 0;

                                                return (
                                                    <motion.div
                                                        key={img.id}
                                                        layout
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
                    <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 px-10">
                        <div className="w-20 h-20 bg-gradient-to-br from-fuchsia-50 to-orange-50 rounded-[2rem] flex items-center justify-center text-fuchsia-300 shadow-inner">
                            <Maximize2 size={40} className="animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-cinzel text-xl text-slate-900">IA de Momentos</h4>
                            <p className="font-outfit text-sm text-slate-500 leading-relaxed">
                                Nuestra IA está analizando las fotos para crear colecciones inteligentes: El Baile, Los Brindis, Invitados y más.
                            </p>
                        </div>
                        <div className="bg-fuchsia-100/50 px-4 py-2 rounded-full border border-fuchsia-100 flex items-center gap-2">
                            <div className="w-2 h-2 bg-[#F21B6A] rounded-full animate-bounce" />
                            <span className="text-[10px] font-fredoka text-[#F21B6A] uppercase tracking-wider">Procesando álbumes...</span>
                        </div>
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
