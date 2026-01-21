'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Camera, Upload } from 'lucide-react';

export default function GaleriaHoli() {
    return (
        <div className="space-y-6 pb-20">
            {/* Header Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/80 backdrop-blur-md p-8 rounded-[2rem] border border-fuchsia-100 shadow-xl shadow-fuchsia-500/5 overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F21B6A]/5 rounded-full blur-3xl -mr-10 -mt-10" />

                <div className="w-12 h-12 bg-fuchsia-100 rounded-2xl flex items-center justify-center text-[#F21B6A] mb-4 relative z-10">
                    <ImageIcon size={24} />
                </div>
                <h3 className="text-3xl font-fredoka text-slate-900 mb-2 relative z-10">Galería Holi</h3>
                <p className="text-slate-600 font-outfit leading-relaxed relative z-10">Sube tus fotos de la boda y compártelas con todos. ¡Vamos a crear el álbum más colorido del mundo!</p>
            </motion.div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center justify-center gap-2 p-6 bg-[#F21B6A] text-white rounded-[2rem] shadow-lg shadow-fuchsia-500/20 active:scale-95 transition-transform">
                    <Camera size={28} />
                    <span className="font-fredoka text-sm">Hacer Foto</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-2 p-6 bg-white border border-fuchsia-100 text-[#F21B6A] rounded-[2rem] shadow-sm active:scale-95 transition-transform">
                    <Upload size={28} />
                    <span className="font-fredoka text-sm">Subir Archivo</span>
                </button>
            </div>

            {/* Photo Grid Placeholder */}
            <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="aspect-square bg-white rounded-[1.5rem] border border-fuchsia-50 shadow-sm flex items-center justify-center relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-50 to-orange-50 opacity-50 group-hover:opacity-80 transition-opacity" />
                        <ImageIcon className="text-fuchsia-200 group-hover:text-fuchsia-300 transition-colors" size={32} />

                        {/* Placeholder Overlay */}
                        <div className="absolute bottom-2 left-2 text-[8px] font-outfit text-fuchsia-400 opacity-60">
                            ID_{Math.random().toString(36).substring(7).toUpperCase()}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
