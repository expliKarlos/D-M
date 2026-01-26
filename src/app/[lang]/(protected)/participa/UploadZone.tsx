'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Check, Loader2, Camera } from 'lucide-react';
import { uploadImage } from '@/lib/services/supabase';
import { db } from '@/lib/services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface UploadZoneProps {
    onUploadSuccess: (url: string, fileSize?: number, fileType?: string) => void;
    maxShots?: number;
    currentShots?: number;
    variant?: 'default' | 'minimalist';
}

export default function UploadZone({
    onUploadSuccess,
    maxShots = 10,
    currentShots = 0,
    variant = 'default'
}: UploadZoneProps) {
    const t = useTranslations('Participation.upload');
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

    const reset = () => {
        setFile(null);
        setPreview(null);
        setUploading(false);
        setProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleUpload = async () => {
        if (!file || isLimitReached) return;

        setUploading(true);
        setProgress(10);

        try {
            const username = localStorage.getItem('d-m-app-username') || t('anonymous');
            const uid = localStorage.getItem('d-m-ui-uid') || 'anonymous';

            // 1. Upload to Supabase Storage (photos bucket)
            const publicUrl = await uploadImage(file, 'participation-gallery', 'photos');
            setProgress(70);

            // 2. AI Validation
            setValidating(true);
            const validateRes = await fetch('/api/validate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageUrl: publicUrl,
                    type: 'photo',
                    author: username,
                    userId: uid
                })
            });

            const validationData = await validateRes.json() as { valid: boolean; message: string };
            setValidating(false);
            setProgress(85);

            if (!validationData.valid) {
                setError(validationData.message);
                setUploading(false);
                return;
            }

            // 3. Save Metadata to Firestore
            const photoData = {
                url: publicUrl,
                content: publicUrl, // Keep content for legacy wall support
                authorId: uid,
                author: username,
                moment: 'Fiesta',
                likesCount: 0,
                liked_by: [],
                timestamp: Date.now(),
                approved: true
            };

            await addDoc(collection(db, 'photos'), photoData);
            setProgress(100);

            // Success
            setTimeout(() => {
                onUploadSuccess(publicUrl, file.size, file.type);
                reset();
            }, 500);

        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : t('error_upload');
            setError(errorMessage);
            setUploading(false);
            setProgress(0);
        }
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
                        className={
                            variant === 'minimalist'
                                ? `relative w-full h-[60px] rounded-2xl border border-slate-200 transition-all flex items-center px-4 cursor-pointer overflow-hidden ${isLimitReached ? 'bg-slate-50 grayscale' : 'bg-white hover:bg-fuchsia-50/30'}`
                                : `relative w-full aspect-video rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 cursor-pointer overflow-hidden ${isLimitReached
                                    ? 'bg-slate-50 border-slate-200 grayscale'
                                    : 'bg-white border-fuchsia-200 border-dashed hover:border-[#F21B6A] hover:bg-fuchsia-50/30'
                                }`
                        }
                    >
                        {variant === 'minimalist' ? (
                            <>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isLimitReached ? 'bg-slate-100 text-slate-400' : 'bg-fuchsia-100 text-[#F21B6A]'}`}>
                                    <Camera size={20} />
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="font-fredoka text-sm text-slate-900">
                                        {isLimitReached ? t('limit_reached') : t('tap_to_capture')}
                                    </p>
                                </div>
                                <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${isLimitReached ? 'bg-slate-200 text-slate-500' : 'bg-orange-100 text-[#FF6B35]'}`}>
                                    {t('shots_left', { count: maxShots - currentShots })}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="absolute top-0 right-0 p-4">
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${isLimitReached ? 'bg-slate-200 text-slate-500' : 'bg-orange-100 text-[#FF6B35]'}`}>
                                        <Camera size={12} />
                                        {t('shots_left_full', { count: maxShots - currentShots })}
                                    </div>
                                </div>

                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${isLimitReached ? 'bg-slate-100 text-slate-400' : 'bg-fuchsia-100 text-[#F21B6A]'}`}>
                                    <Upload size={24} />
                                </div>

                                <p className="font-fredoka text-lg text-slate-900 text-center">
                                    {isLimitReached ? t('limit_reached') : t('tap_to_capture_main')}
                                </p>
                                <p className="font-outfit text-sm text-slate-500 text-center mt-1">
                                    {isLimitReached ? t('limit_reached_desc') : t('upload_desc')}
                                </p>
                            </>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
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
                                    {t('upload_button')}
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
                                        {validating ? t('analyzing') : t('revealing', { progress })}
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
