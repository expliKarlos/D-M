'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMoments, type Moment } from '@/lib/actions/admin-folders';
import { uploadImage } from '@/lib/services/supabase';
import { db } from '@/lib/services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ChevronLeft, Upload, X, Loader2, CheckCircle2, AlertCircle, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface UploadTask {
    file: File;
    preview: string;
    status: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
    progress: number;
}

export default function BulkUploadPage() {
    const [moments, setMoments] = useState<Moment[]>([]);
    const [selectedMoment, setSelectedMoment] = useState<string>('');
    const [tasks, setTasks] = useState<UploadTask[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        getMoments().then(data => {
            setMoments(data);
            if (data.length > 0) setSelectedMoment(data[0].id);
        });
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newTasks: UploadTask[] = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            status: 'pending',
            progress: 0
        }));
        setTasks(prev => [...prev, ...newTasks]);
    };

    const removeTask = (index: number) => {
        setTasks(prev => {
            const newTasks = [...prev];
            URL.revokeObjectURL(newTasks[index].preview);
            newTasks.splice(index, 1);
            return newTasks;
        });
    };

    const startUpload = async () => {
        if (tasks.length === 0 || !selectedMoment) return;
        setIsUploading(true);

        for (let i = 0; i < tasks.length; i++) {
            if (tasks[i].status === 'success') continue;

            setTasks(prev => {
                const updated = [...prev];
                updated[i].status = 'uploading';
                return updated;
            });

            try {
                // 1. Upload to Supabase Storage
                const publicUrl = await uploadImage(tasks[i].file, 'participation-gallery', 'photos');

                // 2. Save to Firestore
                await addDoc(collection(db, 'photos'), {
                    url: publicUrl,
                    content: publicUrl,
                    moment: selectedMoment,
                    timestamp: Date.now(),
                    author: 'Admin',
                    authorId: 'admin',
                    approved: true,
                    likesCount: 0,
                    liked_by: []
                });

                setTasks(prev => {
                    const updated = [...prev];
                    updated[i].status = 'success';
                    updated[i].progress = 100;
                    return updated;
                });
            } catch (error: any) {
                console.error('Upload error:', error);
                setTasks(prev => {
                    const updated = [...prev];
                    updated[i].status = 'error';
                    updated[i].error = error.message;
                    return updated;
                });
            }

            // Stagger to avoid overwhelming the network
            await new Promise(r => setTimeout(r, 200));
        }

        setIsUploading(false);
    };

    const completedCount = tasks.filter(t => t.status === 'success').length;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
            >
                <ChevronLeft size={20} />
                Volver a Galería
            </button>

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                    <h2 className="text-3xl font-fredoka font-bold">Subida Masiva</h2>
                    <p className="opacity-70 mt-1">Sube múltiples fotos de una vez a la carpeta seleccionada</p>
                </div>

                <div className="p-8 space-y-8">
                    {/* Folder Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">1. Selecciona la Carpeta Destino</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {moments.map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => setSelectedMoment(m.id)}
                                    className={cn(
                                        "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                                        selectedMoment === m.id ? "border-orange-500 bg-orange-50" : "border-slate-100 hover:border-slate-300"
                                    )}
                                >
                                    <span className="text-2xl">{m.icon}</span>
                                    <span className="text-xs font-bold text-center">{m.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* File Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">2. Selecciona las Fotos</label>
                        <div className="relative group/upload">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileSelect}
                                disabled={isUploading}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="border-3 border-dashed border-slate-200 group-hover/upload:border-orange-300 rounded-3xl p-12 text-center transition-all bg-slate-50 group-hover/upload:bg-orange-50/30">
                                <Upload className="mx-auto text-slate-400 group-hover/upload:text-orange-500 mb-4 transition-colors" size={48} />
                                <p className="text-slate-600 font-medium">Haz clic o arrastra para añadir fotos</p>
                                <p className="text-slate-400 text-sm mt-1">Soporta JPG, PNG, WebP</p>
                            </div>
                        </div>
                    </div>

                    {/* Queue */}
                    {tasks.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-4 border-slate-100">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">COLA DE SUBIDA ({tasks.length} archivos)</label>
                                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase">
                                    {completedCount} / {tasks.length} Completado
                                </span>
                            </div>

                            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                                {tasks.map((task, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-100 shadow-sm">
                                        <Image src={task.preview} alt="preview" fill className="object-cover" />

                                        {/* Status Overlay */}
                                        <div className={cn(
                                            "absolute inset-0 flex items-center justify-center transition-all",
                                            task.status === 'uploading' ? "bg-black/40 backdrop-blur-[2px]" :
                                                task.status === 'success' ? "bg-green-500/20 backdrop-blur-[1px]" :
                                                    task.status === 'error' ? "bg-red-500/40 backdrop-blur-[1px]" : "bg-transparent"
                                        )}>
                                            {task.status === 'uploading' && <Loader2 className="text-white animate-spin" size={24} />}
                                            {task.status === 'success' && <CheckCircle2 className="text-green-500 fill-white" size={32} />}
                                            {task.status === 'error' && <AlertCircle className="text-white" size={32} />}
                                        </div>

                                        {/* Progress Bar (if uploading) */}
                                        {task.status === 'uploading' && (
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                                                <div className="h-full bg-orange-500 animate-pulse" style={{ width: '100%' }} />
                                            </div>
                                        )}

                                        {/* Remove Button */}
                                        {task.status === 'pending' && (
                                            <button
                                                onClick={() => removeTask(idx)}
                                                className="absolute top-1 right-1 p-1 bg-white/90 rounded-full text-red-500 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={startUpload}
                                disabled={isUploading || completedCount === tasks.length}
                                className="w-full h-16 bg-orange-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-orange-500/20 hover:bg-orange-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={24} />
                                        Subiendo...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={24} />
                                        Comenzar Subida ({tasks.length - completedCount} fotos)
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
