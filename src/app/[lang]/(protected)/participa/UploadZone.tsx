'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Check, Loader2, Camera } from 'lucide-react';
import { supabase } from '@/lib/services/supabase';
import Image from 'next/image';

interface UploadZoneProps {
    onUploadSuccess: (url: string) => void;
    maxShots?: number;
    currentShots?: number;
}

export default function UploadZone({ onUploadSuccess, maxShots = 10, currentShots = 0 }: UploadZoneProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [validating, setValidating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isLimitReached = currentShots >= maxShots;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file || isLimitReached) return;

        setUploading(true);
        setProgress(10); // Initial progress

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `participation-gallery/${fileName}`;

            // Simulate progress (since standard supabase-js upload doesn't have progress hook easily for simple storage.upload)
            // For a real app, you might use XHR or a custom storage wrapper, but for this demo:
            const interval = setInterval(() => {
                setProgress(prev => (prev < 90 ? prev + 10 : prev));
            }, 300);

            const { data, error: uploadError } = await supabase.storage
                .from('photos')
                .upload(filePath, file);

            clearInterval(interval);

            if (uploadError) throw uploadError;

            setProgress(100);

            const { data: { publicUrl } } = supabase.storage
                .from('photos')
                .getPublicUrl(filePath);

            // --- AI Validation Middleware ---
            setProgress(95);
            setValidating(true);

            const validateRes = await fetch('/api/validate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageUrl: publicUrl,
                    type: 'photo',
                    author: localStorage.getItem('d-m-app-username') || 'Invitado', // Use a persistent name if available
                    userId: 'anonymous'
                })
            });

            const validationData = await validateRes.json();
            setValidating(false);
            setProgress(100);

            if (!validationData.valid) {
                setError(validationData.message);
                setUploading(false);
                return;
            }

            // Success
            setTimeout(() => {
                onUploadSuccess(publicUrl);
                reset();
            }, 500);

        } catch (err: any) {
            setError(err.message || 'Error al subir la imagen');
            setUploading(false);
            setProgress(0);
        }
    };

    const reset = () => {
        setFile(null);
        setPreview(null);
        setUploading(false);
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="w-full space-y-4">
            <AnimatePresence mode="wait">
                {!preview ? (
                    <motion.div
                        key="dropzone"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => !isLimitReached && fileInputRef.current?.click()}
                        className={`relative w-full aspect-video rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 cursor-pointer overflow-hidden ${isLimitReached
                            ? 'bg-slate-50 border-slate-200 grayscale'
                            : 'bg-white border-fuchsia-200 border-dashed hover:border-[#F21B6A] hover:bg-fuchsia-50/30'
                            }`}
                    >
                        <div className="absolute top-0 right-0 p-4">
                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${isLimitReached ? 'bg-slate-200 text-slate-500' : 'bg-orange-100 text-[#FF6B35]'}`}>
                                <Camera size={12} />
                                {maxShots - currentShots} Disparos
                            </div>
                        </div>

                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${isLimitReached ? 'bg-slate-100 text-slate-400' : 'bg-fuchsia-100 text-[#F21B6A]'}`}>
                            <Upload size={24} />
                        </div>

                        <p className="font-fredoka text-lg text-slate-900 text-center">
                            {isLimitReached ? 'Carrete Agotado' : 'Toca para capturar'}
                        </p>
                        <p className="font-outfit text-sm text-slate-500 text-center mt-1">
                            {isLimitReached ? 'Has alcanzado el límite de la cámara desechable' : 'Sube un momento de la celebración'}
                        </p>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={isLimitReached}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative w-full aspect-video rounded-[2.5rem] overflow-hidden border border-fuchsia-100 shadow-xl"
                    >
                        <Image
                            src={preview}
                            alt="Preview"
                            fill
                            className="object-cover"
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-all group-hover:backdrop-blur-none" />

                        {/* Controls */}
                        {!uploading && (
                            <div className="absolute inset-0 flex items-center justify-center gap-4">
                                <button
                                    onClick={reset}
                                    className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 active:scale-90 transition-transform"
                                >
                                    <X size={24} />
                                </button>
                                <button
                                    onClick={handleUpload}
                                    className="h-12 px-8 bg-[#F21B6A] text-white rounded-2xl font-fredoka shadow-lg shadow-fuchsia-500/30 flex items-center gap-2 active:scale-95 transition-transform"
                                >
                                    <Check size={20} />
                                    Subir Foto
                                </button>
                            </div>
                        )}

                        {/* Progress Overlay */}
                        <AnimatePresence>
                            {uploading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 bg-[#F21B6A]/80 backdrop-blur-md flex flex-col items-center justify-center p-10"
                                >
                                    <Loader2 className="animate-spin text-white mb-6" size={40} />
                                    <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mb-3">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            className="h-full bg-white"
                                        />
                                    </div>
                                    <p className="text-white font-fredoka tracking-wider uppercase text-xs">
                                        {validating ? 'Analizando con IA...' : `Revelando Imagen... ${progress}%`}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <p className="text-red-500 text-xs font-outfit text-center bg-red-50 p-3 rounded-xl border border-red-100">
                    {error}
                </p>
            )}
        </div>
    );
}
