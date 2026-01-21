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

            setImages(galleryImages);
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
            <div className="px-4 pt-6 space-y-8">
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
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <AnimatePresence>
                                    {images.map((img, i) => (
                                        <motion.div
                                            key={img.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="aspect-square relative rounded-2xl overflow-hidden border border-fuchsia-50/10 shadow-sm group bg-white ring-1 ring-slate-100"
                                        >
                                            <Image
                                                src={img.url}
                                                alt={`Boda - ${img.id}`}
                                                fill
                                                sizes="(max-width: 768px) 50vw, 33vw"
                                                className="object-cover transition-all duration-700 group-hover:scale-105"
                                            />
                                            {/* Minimal info overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                                <span className="text-[9px] text-white/90 font-outfit font-medium bg-black/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                                                    {new Date(img.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 max-w-[280px] mx-auto grayscale opacity-50">
                        <div className="w-16 h-16 bg-fuchsia-50 rounded-full flex items-center justify-center text-fuchsia-300">
                            <Maximize2 size={32} />
                        </div>
                        <h4 className="font-fredoka text-slate-900">IA de Momentos</h4>
                        <p className="font-outfit text-xs text-slate-500 leading-relaxed">
                            Nuestra IA está agrupando los mejores instantes por categorías: Bailes, Brindis y Más.
                        </p>
                    </div>
                )}

                {/* Info Card - Improved Style */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-orange-50 to-fuchsia-50 p-6 rounded-[2rem] border border-white shadow-sm flex items-start gap-4"
                >
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-[#FF6B35] shrink-0">
                        <Camera size={20} />
                    </div>
                    <div>
                        <h4 className="font-fredoka text-orange-950 text-sm">Carrete Limitado</h4>
                        <p className="text-xs font-outfit text-orange-900/60 mt-1 leading-relaxed">
                            Tienes {maxShots} disparos totales para capturar la esencia de hoy. ¡Elige tus momentos con cuidado!
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
