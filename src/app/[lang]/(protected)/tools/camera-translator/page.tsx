'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ChevronLeft, Loader2, RefreshCw, Languages, Search, Image as ImageIcon, Copy, Volume2, Check, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useChatStore } from '@/lib/store/chat-store';

export default function CameraTranslatorPage() {
    const router = useRouter();
    const { open, setPendingMessage } = useChatStore();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
                setResult(null);
                processImage(reader.result as string, file.type);
            };
            reader.readAsDataURL(file);
        }
    };

    const processImage = async (base64Data: string, mimeType: string) => {
        setIsLoading(true);
        try {
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

    const playSpeech = () => {
        if (!result || typeof window === 'undefined') return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(result);
        utterance.lang = 'es-ES';

        const voices = window.speechSynthesis.getVoices();
        const spanishVoice = voices.find(v => v.lang.startsWith('es-'));
        if (spanishVoice) utterance.voice = spanishVoice;

        window.speechSynthesis.speak(utterance);
    };

    const copyToClipboard = () => {
        if (!result) return;
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const askConcierge = () => {
        if (!result) return;
        const prompt = `He traducido este texto: "${result}". ¿Puedes darme más información o consejos sobre esto en el contexto de la boda?`;
        setPendingMessage(prompt);
        open();
    };

    const reset = () => {
        setSelectedImage(null);
        setResult(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-outfit pb-20 overflow-x-hidden">
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] aspect-square bg-[#FF9933] rounded-full blur-[100px]" />
                <div className="absolute middle-0 left-[-20%] w-[70%] aspect-square bg-[#FF0080] rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-20%] w-[50%] aspect-square bg-[#702963] rounded-full blur-[100px]" />
            </div>

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
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#FF9933] rounded-full flex items-center justify-center border-4 border-[#0f172a] shadow-lg">
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
                        {/* Smaller Preview Window */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative w-32 h-32 mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 rotate-3 transition-transform hover:rotate-0"
                        >
                            <Image src={selectedImage} alt="Captured" fill className="object-cover" />
                            {isLoading && (
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                                    <Loader2 size={24} className="text-primary animate-spin" />
                                </div>
                            )}
                        </motion.div>

                        {isLoading && !result && (
                            <div className="text-center">
                                <motion.p
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="font-black uppercase tracking-[0.2em] text-sm text-[#FF9933]"
                                >
                                    Escaneando caracteres...
                                </motion.p>
                            </div>
                        )}

                        <AnimatePresence>
                            {result && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="relative group pb-10"
                                >
                                    {/* Pergamino / Paper Design */}
                                    <div className="relative bg-[#f4ece1] text-[#2c241e] rounded-[1rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-x-4 border-[#e6dccf] overflow-hidden min-h-[200px]">
                                        {/* Paper Texture Overlay */}
                                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/handmade-paper.png")' }} />

                                        {/* Corner Folds Decor */}
                                        <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-black/5 to-transparent rounded-bl-3xl" />
                                        <div className="absolute bottom-0 left-0 w-8 h-8 bg-gradient-to-tr from-black/5 to-transparent rounded-tr-2xl" />

                                        <div className="flex items-center gap-3 mb-6 border-b border-[#dcd2c5] pb-4">
                                            <div className="p-2 bg-[#FF9933]/10 rounded-lg text-[#FF9933]">
                                                <Languages size={20} />
                                            </div>
                                            <span className="font-black text-[10px] uppercase tracking-[0.2em] text-[#8b7355]">Traducción Final</span>
                                        </div>

                                        <p className="text-lg font-serif italic leading-relaxed whitespace-pre-line relative z-10">
                                            {result}
                                        </p>

                                        {/* Result Actions */}
                                        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-[#dcd2c5]">
                                            <button
                                                onClick={playSpeech}
                                                className="flex-1 h-12 bg-[#2c241e] text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
                                            >
                                                <Volume2 size={16} />
                                                Escuchar
                                            </button>
                                            <button
                                                onClick={copyToClipboard}
                                                className={`
                                                    w-12 h-12 rounded-xl flex items-center justify-center transition-all border-2
                                                    ${copied ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-transparent border-[#2c241e]/10 text-[#2c241e]'}
                                                `}
                                            >
                                                {copied ? <Check size={20} /> : <Copy size={20} />}
                                            </button>
                                        </div>

                                        {/* Contextual IA Button */}
                                        <button
                                            onClick={askConcierge}
                                            className="w-full mt-4 h-12 bg-[#FF9933] hover:bg-[#FF9933]/90 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg shadow-orange-200/20 active:scale-95 transition-all"
                                        >
                                            <Sparkles size={14} />
                                            💡 Preguntar detalles al Concierge
                                        </button>
                                    </div>

                                    {/* Paper Shadow Lift Effect */}
                                    <div className="absolute -bottom-2 -left-2 -right-2 h-10 bg-black/20 blur-xl -z-10 rounded-full mx-10" />
                                </motion.div>
                            )}
                        </AnimatePresence>

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
