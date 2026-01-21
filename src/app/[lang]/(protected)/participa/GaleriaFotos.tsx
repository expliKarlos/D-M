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
    const maxShots = 10;

    // Load shots from localStorage
    useEffect(() => {
        const savedShots = localStorage.getItem('d-m-app-shots');
        if (savedShots) {
            setCurrentShots(parseInt(savedShots, 10));
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

            const galleryImages: GalleryImage[] = data.map((row: any) => ({
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
                (payload) => {
                    console.log('Real-time update:', payload);
                    fetchImages(); // Refetch on any change
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleUploadSuccess = (url: string) => {
        // Increment shots count locally
        const nextShots = currentShots + 1;
        setCurrentShots(nextShots);
        localStorage.setItem('d-m-app-shots', nextShots.toString());
    };

    const totalImages = images.length;

    return (
        <div className="space-y-10 pb-24">
            {/* Upload Section */}
            <div className="px-2">
                <UploadZone
                    onUploadSuccess={handleUploadSuccess}
                    currentShots={currentShots}
                    maxShots={maxShots}
                />
            </div>

            {/* Gallery Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-2xl font-fredoka text-slate-900 flex items-center gap-2">
                        Galería de la Boda
                        <span className="text-xs font-outfit text-slate-400 font-normal px-2 py-0.5 bg-slate-100 rounded-full">
                            {totalImages} fotos
                        </span>
                    </h3>
                </div>

                {totalImages === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-slate-300 gap-4">
                        <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center border border-dashed border-slate-200">
                            <ImageIcon size={40} />
                        </div>
                        <p className="font-outfit text-sm">Aún no hay fotos reveladas.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <AnimatePresence>
                            {images.map((img, i) => (
                                <motion.div
                                    key={img.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="aspect-square relative rounded-3xl overflow-hidden border border-fuchsia-100 shadow-sm group bg-white"
                                >
                                    <Image
                                        src={img.url}
                                        alt={`Boda - ${img.id}`}
                                        fill
                                        sizes="(max-width: 768px) 50vw, 33vw"
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                        <span className="text-[10px] text-white/80 font-outfit bg-white/10 backdrop-blur-md px-2 py-1 rounded-lg">
                                            {new Date(img.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Visual Limitation Message */}
            <div className="bg-orange-50/50 p-6 rounded-[2rem] border border-orange-100 flex items-start gap-4 mx-2">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-[#FF6B35] shrink-0">
                    <Camera size={20} />
                </div>
                <div>
                    <h4 className="font-fredoka text-orange-900 text-sm">Modo Cámara Desechable</h4>
                    <p className="text-xs font-outfit text-orange-700/80 mt-1 leading-relaxed">
                        Para capturar la esencia de la boda, cada invitado tiene un carrete limitado de {maxShots} fotos. ¡Elige bien tus disparos!
                    </p>
                </div>
            </div>
        </div>
    );
}
