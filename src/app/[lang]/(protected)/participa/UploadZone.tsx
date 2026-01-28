'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Check, Loader2, Camera, Wifi, WifiOff } from 'lucide-react';
import { uploadImage, createImageRecord } from '@/lib/services/supabase';
import { db } from '@/lib/services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import imageCompression from 'browser-image-compression';
import { savePendingUpload } from '@/lib/services/offline-storage';
import { Switch } from '@/components/ui/switch';
import { Moment } from '@/lib/contexts/GalleryContext';

interface UploadZoneProps {
    onUploadSuccess: (url: string, fileSize?: number, fileType?: string) => void;
    maxShots?: number;
    currentShots?: number;
    variant?: 'default' | 'minimalist';
    moments?: Moment[];
}

export default function UploadZone({
    onUploadSuccess,
    maxShots = 10,
    currentShots = 0,
    variant = 'default',
    moments = []
}: UploadZoneProps) {
    const t = useTranslations('Participation.gallery.upload');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [validating, setValidating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusDetail, setStatusDetail] = useState<string>(''); // For debugging
    const [error, setError] = useState<string | null>(null);
    const [wifiOnly, setWifiOnly] = useState(false);
    const [selectedMomentId, setSelectedMomentId] = useState<string>('Fiesta'); // Default
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
        setStatusDetail('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleUpload = async () => {
        if (!file || isLimitReached) return;

        setUploading(true);
        setStatusDetail('Comprimiendo...');
        setProgress(5);

        try {
            const username = localStorage.getItem('d-m-app-username') || t('anonymous');
            const uid = localStorage.getItem('d-m-ui-uid') || 'anonymous';

            // 1. Compression (Client Side) - Always create webp
            setProgress(10);
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                initialQuality: 0.8
            };
            const compressedFile = await imageCompression(file, options);

            // 2. Parallel or Deferred Upload
            setProgress(30);
            setStatusDetail('Subiendo copia rápida...');

            // Always upload Optimized to Supabase (Lightweight)
            const publicUrl = await uploadImage(compressedFile, 'participation-gallery', 'photos'); // Await directly

            let driveFileId = 'pending_wifi';
            let shouldUploadToDriveNow = !wifiOnly;

            // If wifiOnly is ON, we check connection type roughly if possible, or just defer blindly?
            // User requested explicit "Only on WiFi" toggle.
            // If toggle is ON, we defer. If OFF, we upload now.

            // However, we need a Supabase Record ID to link the deferred upload.
            // Ideally we create the record *first* with 'pending', then update it.
            // But `createImageRecord` uses `drive_file_id` as a field. 
            // We'll insert 'pending_wifi' as the ID initially.

            const timestamp = Date.now();
            setStatusDetail('Registrando foto...');

            // Insert Supabase Record
            const supabaseRecord = await createImageRecord({
                url_optimized: publicUrl,
                drive_file_id: driveFileId,
                category_id: selectedMomentId,
                author_id: uid,
                author_name: username,
                timestamp: timestamp
            });

            if (wifiOnly) {
                // DEFERRED PATH
                setStatusDetail('Guardando para Wi-Fi...');
                // Save original file to IDB for background sync
                await savePendingUpload(file, {
                    fileName: file.name,
                    folderId: selectedMomentId, // Dynamic folder ID
                    mimeType: file.type,
                    supabaseId: supabaseRecord.id,
                    authorId: uid
                });
            } else {
                // IMMEDIATE PATH
                // Upload Original to Google Drive
                // 2b. Get Drive Upload URL
                setStatusDetail('Iniciando subida a Drive...');
                setProgress(50);
                const driveRes = await fetch('/api/drive/upload-url', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fileName: file.name,
                        fileType: file.type,
                        folderId: selectedMomentId // Pass folderId here too
                    })
                });

                if (driveRes.ok) {
                    const { uploadUrl } = await driveRes.json();
                    setStatusDetail('Enviando a Drive...');
                    // Upload to Drive
                    const driveUploadRes = await fetch(uploadUrl, {
                        method: 'PUT',
                        headers: { 'Content-Type': file.type },
                        body: file
                    });

                    if (driveUploadRes.ok) {
                        const driveData = await driveUploadRes.json();
                        driveFileId = driveData.id;

                        setStatusDetail('Sincronizando...');
                        // Update Supabase Record with real ID
                        await fetch('/api/drive/sync-update', {
                            method: 'POST',
                            body: JSON.stringify({
                                supabaseId: supabaseRecord.id,
                                driveFileId: driveFileId
                            })
                        });
                    } else {
                        throw new Error(`Drive upload failed: ${driveUploadRes.statusText}`);
                    }
                } else {
                    const errorData = await driveRes.json();
                    throw new Error(errorData.error || 'Failed to get upload URL');
                }
            }

            setProgress(70);

            // 4. AI Validation (on Optimized URL)
            // We run this on the optimized URL which is practically real-time
            setValidating(true);
            setStatusDetail('Validando imagen...');
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
                // Note: If invalid, we probably should delete the record? 
                // For now, let's just show error.
                setError(validationData.message);
                setUploading(false);
                return;
            }

            // 5. Firestore Write (Legacy)
            setStatusDetail('Finalizando...');
            const photoData = {
                url: publicUrl,
                content: publicUrl,
                authorId: uid,
                author: username,
                moment: selectedMomentId,
                likesCount: 0,
                liked_by: [],
                timestamp: timestamp,
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
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : t('error_upload');
            // Append status detail to error for context
            setError(`${errorMessage} (${statusDetail})`);
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
                        className="bg-white rounded-[2rem] p-4 border border-fuchsia-100 shadow-sm"
                    >
                        {/* Toggle Area */}
                        {/* Toggle & Moment Selector Area */}
                        <div className="flex flex-col gap-3 mb-4">
                            <div className="grid grid-cols-2 gap-3">
                                {/* WiFi Toggle - Left Half */}
                                <div className="bg-slate-50 rounded-2xl p-3 flex  items-center justify-between border border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-full ${wifiOnly ? 'bg-fuchsia-100 text-[#F21B6A]' : 'bg-slate-200 text-slate-500'}`}>
                                            {wifiOnly ? <Wifi size={14} /> : <WifiOff size={14} />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Upload Mode</span>
                                            <span className="text-xs font-semibold text-slate-700">{wifiOnly ? "Solo Wi-Fi" : "Datos + Wi-Fi"}</span>
                                        </div>
                                    </div>
                                    <Switch checked={wifiOnly} onCheckedChange={setWifiOnly} />
                                </div>

                                {/* Moment Selector - Right Half */}
                                {moments.length > 0 && (
                                    <div className="bg-slate-50 rounded-2xl p-1 border border-slate-100 relative">
                                        <select
                                            value={selectedMomentId}
                                            onChange={(e) => setSelectedMomentId(e.target.value)}
                                            className="w-full h-full absolute inset-0 opacity-0 cursor-pointer z-10"
                                        >
                                            {moments.map(m => (
                                                <option key={m.id} value={m.id}>{m.name}</option>
                                            ))}
                                        </select>
                                        <div className="h-full flex items-center justify-between px-2">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <div className="p-1.5 rounded-full bg-orange-100 text-[#FF6B35] shrink-0">
                                                    <span className="text-xs">{moments.find(m => m.id === selectedMomentId)?.icon || '✨'}</span>
                                                </div>
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Carpeta</span>
                                                    <span className="text-xs font-semibold text-slate-700 truncate">
                                                        {moments.find(m => m.id === selectedMomentId)?.name || 'Seleccionar'}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-slate-400">▼</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div
                            onClick={() => !isLimitReached && fileInputRef.current?.click()}
                            className={
                                variant === 'minimalist'
                                    ? `relative w-full h-[60px] rounded-2xl border border-slate-200 transition-all flex items-center px-4 cursor-pointer overflow-hidden ${isLimitReached ? 'bg-slate-50 grayscale' : 'bg-slate-50 hover:bg-fuchsia-50/30'}`
                                    : `relative w-full aspect-video rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 cursor-pointer overflow-hidden ${isLimitReached
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
                                className="hidden"
                                onChange={handleFileChange}
                                disabled={isLimitReached}
                            />
                        </div>
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
                                        {statusDetail || (validating ? t('analyzing') : t('revealing'))}
                                    </p>

                                    {/* Deferred Message */}
                                    {wifiOnly && progress > 20 && (
                                        <p className="text-white/80 font-outfit text-[10px] mt-2 text-center">
                                            Guardando original para subir con Wi-Fi...
                                        </p>
                                    )}
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
