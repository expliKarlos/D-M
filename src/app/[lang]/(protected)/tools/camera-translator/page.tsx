'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ChevronLeft, Loader2, RefreshCw, Languages, Search, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CameraTranslatorPage() {
    const router = useRouter();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
                setResult(null); // Clear previous result
                processImage(reader.result as string, file.type);
            };
            reader.readAsDataURL(file);
        }
    };

    const processImage = async (base64Data: string, mimeType: string) => {
        setIsLoading(true);
        try {
            // Remove prefix from base64 string
            const base64Content = base64Data.split(',')[1];

            const response = await fetch('/api/camera-translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64Content, mimeType })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);
            setResult(data.translation);
        } catch (error) {
            console.error('Processing error:', error);
            alert('Error al procesar la imagen. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const reset = () => {
        setSelectedImage(null);
        setResult(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-outfit pb-20 overflow-x-hidden">
            {/* Holi Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] aspect-square bg-[#FF9933] rounded-full blur-[100px]" />
                <div className="absolute middle-0 left-[-20%] w-[70%] aspect-square bg-[#FF0080] rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-20%] w-[50%] aspect-square bg-[#702963] rounded-full blur-[100px]" />
            </div>

            {/* Header */}
            <header className="relative z-50 p-6 flex items-center justify-between bg-black/20 backdrop-blur-lg border-b border-white/10 sticky top-0">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white border border-white/20 active:scale-90 transition-all"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">IA Vision Tool</span>
                    <h1 className="text-xl font-black italic">Cámara Traductora</h1>
                </div>
                <div className="w-10" />
            </header>

            <main className="relative z-10 p-6 space-y-8">
                {/* Capture Area */}
                {!selectedImage ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="aspect-[3/4] rounded-[3rem] border-2 border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden group mb-10"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-[#FF9933]/5 to-[#702963]/5 group-hover:opacity-100 transition-opacity opacity-0" />

                        <div className="relative mb-6">
                            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center border border-white/20 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                <Camera size={48} className="text-white/80" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center border-4 border-[#0f172a] shadow-lg">
                                <Search size={20} className="text-white" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-black mb-2 tracking-tight">Escanea Menús o Señales</h2>
                        <p className="text-white/40 text-sm max-w-[240px] leading-relaxed mb-8">
                            Apunta a cualquier texto en Inglés o Hindi para obtener la traducción al instante.
                        </p>

                        <div className="space-y-4 w-full max-w-[200px]">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-14 bg-white text-[#0f172a] rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
                            >
                                <Camera size={20} />
                                Abrir Cámara
                            </button>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full text-white/60 text-sm font-medium flex items-center justify-center gap-2 hover:text-white transition-colors"
                            >
                                <ImageIcon size={18} />
                                Elegir de Galería
                            </button>
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            capture="environment"
                            onChange={handleFileChange}
                        />
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        {/* Image Preview Window */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10"
                        >
                            <Image src={selectedImage} alt="Captured" fill className="object-cover" />

                            {/* Scanning Overlays */}
                            {isLoading && (
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center">
                                    <div className="relative w-20 h-20">
                                        <Loader2 size={80} className="text-primary animate-spin" />
                                        <Languages size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" />
                                    </div>
                                    <motion.p
                                        animate={{ opacity: [0.4, 1, 0.4] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="mt-6 font-black uppercase tracking-[0.2em] text-sm"
                                    >
                                        Escaneando caracteres...
                                    </motion.p>

                                    {/* Scan bar animation */}
                                    <motion.div
                                        animate={{ top: ['0%', '100%', '0%'] }}
                                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_primary]"
                                    />
                                </div>
                            )}
                        </motion.div>

                        {/* Result Area */}
                        <AnimatePresence>
                            {result && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl"
                                >
                                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                                                <Languages size={18} />
                                            </div>
                                            <span className="font-black text-[10px] uppercase tracking-widest text-[#FF9933]">Traducción IA</span>
                                        </div>
                                        <button
                                            onClick={reset}
                                            className="p-2 bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors"
                                        >
                                            <RefreshCw size={18} />
                                        </button>
                                    </div>
                                    <div className="prose prose-invert max-w-none">
                                        <p className="text-lg font-medium leading-relaxed whitespace-pre-line text-white/90">
                                            {result}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Action Buttons if Finished or Idle */}
                        {!isLoading && (
                            <div className="flex gap-4">
                                <button
                                    onClick={reset}
                                    className="flex-1 h-16 bg-white/5 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-white/10 active:scale-95 transition-all"
                                >
                                    <RefreshCw size={20} />
                                    Nueva Foto
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Info Pills */}
                <div className="flex flex-wrap gap-2 justify-center mt-6">
                    {['Menús', 'Señales', 'Folletos', 'Textos'].map(tag => (
                        <span key={tag} className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/40 tracking-wider">
                            #{tag.toUpperCase()}
                        </span>
                    ))}
                </div>
            </main>
        </div>
    );
}
