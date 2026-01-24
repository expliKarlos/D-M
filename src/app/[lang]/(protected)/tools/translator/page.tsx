'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, Languages, ArrowRight, Loader2, Trash2, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TranslationResult {
    en: string;
    hi: string;
    pa: string;
}

export default function TranslatorPage() {
    const router = useRouter();
    const [inputText, setInputText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [translations, setTranslations] = useState<TranslationResult | null>(null);

    // Recognition Ref
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // Initialize Speech Recognition
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'speechRecognition' in window)) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).speechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.lang = 'es-ES';
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInputText(prev => prev ? `${prev} ${transcript}` : transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            setIsListening(true);
            recognitionRef.current?.start();
        }
    };

    const handleTranslate = async () => {
        if (!inputText.trim()) return;
        setIsLoading(true);
        try {
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: inputText })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            setTranslations(data);
        } catch (error) {
            console.error('Translation error:', error);
            alert('Error al traducir. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const playSpeech = (text: string, lang: string) => {
        if (typeof window === 'undefined') return;

        // Stop any current speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Map language codes
        const langMap: Record<string, string> = {
            'en': 'en-US',
            'hi': 'hi-IN',
            'pa': 'pa-IN'
        };
        utterance.lang = langMap[lang] || lang;

        // Find a suitable voice
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang.startsWith(utterance.lang));
        if (voice) utterance.voice = voice;

        window.speechSynthesis.speak(utterance);
    };

    const handleQuickPhrase = async (phrase: string) => {
        setInputText(phrase);
        setIsLoading(true);
        try {
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: phrase })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error);
            setTranslations(data);

            // Auto-play Hindi
            if (data.hi) {
                setTimeout(() => playSpeech(data.hi, 'hi'), 500);
            }
        } catch (error) {
            console.error('Quick phrase error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const quickPhrases = [
        { label: '💍 Felicidades', text: '¡Felicidades por vuestra boda!', color: 'bg-rose-50 text-rose-600 border-rose-100' },
        { label: '🍲 ¡Qué rico!', text: '¡Qué comida tan rica! Está deliciosa.', color: 'bg-orange-50 text-orange-600 border-orange-100' },
        { label: '📸 Foto', text: '¿Podemos hacernos una foto juntos?', color: 'bg-blue-50 text-blue-600 border-blue-100' },
        { label: '🙏 Gracias', text: 'Muchas gracias por todo.', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
        { label: '👋 Hola', text: 'Hola, ¿cómo estás?', color: 'bg-purple-50 text-purple-600 border-purple-100' },
        { label: '🎵 Música', text: '¡Me encanta esta canción!', color: 'bg-amber-50 text-amber-600 border-amber-100' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-outfit">
            {/* Holi Header */}
            <div className="relative h-64 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF9933] via-[#FF0080] to-[#702963]" />
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-48 h-48 bg-yellow-300 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 p-6 flex flex-col justify-between h-full">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 active:scale-95 transition-all"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <div className="mb-4">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/30">
                                <Languages className="text-white" size={24} />
                            </div>
                            <span className="text-[10px] font-black text-white/80 uppercase tracking-[0.3em]">Holi Edition</span>
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Traductor <br />Instantáneo</h1>
                    </div>
                </div>
            </div>

            <main className="px-6 -mt-10 relative z-20 space-y-6">
                {/* Input Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-100"
                >
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Español</span>
                        <button
                            onClick={() => setInputText('')}
                            className="p-2 text-slate-300 hover:text-red-400 transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>

                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Escribe o pulsa el micro..."
                        className="w-full min-h-[120px] text-xl font-bold text-slate-800 placeholder:text-slate-200 focus:outline-none resize-none hide-scrollbar"
                    />

                    <div className="flex items-center gap-3 mt-4">
                        <button
                            onClick={toggleListening}
                            className={`
                                flex-none w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500
                                ${isListening
                                    ? 'bg-red-500 text-white shadow-lg shadow-red-200 animate-pulse'
                                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                }
                            `}
                        >
                            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                        </button>

                        <button
                            onClick={handleTranslate}
                            disabled={isLoading || !inputText.trim()}
                            className="flex-1 h-14 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-xl shadow-slate-200 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    Traducir Ahora
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* Quick Phrases Carousel */}
                <div className="space-y-3">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Frases Rápidas</h3>
                    <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar -mx-6 px-6 text-slate-800">
                        {quickPhrases.map((phrase, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleQuickPhrase(phrase.text)}
                                className={`flex-none px-5 py-3 rounded-2xl border font-bold text-sm transition-all active:scale-95 shadow-sm whitespace-nowrap ${phrase.color}`}
                            >
                                {phrase.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results Section */}
                <AnimatePresence>
                    {translations && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-4"
                        >
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Resultados</h3>

                            {/* Card English */}
                            <TranslationCard
                                label="English"
                                text={translations.en}
                                langCode="en"
                                onPlay={() => playSpeech(translations.en, 'en')}
                                color="border-l-blue-400"
                            />

                            {/* Card Hindi */}
                            <TranslationCard
                                label="Hindi / हिन्दी"
                                text={translations.hi}
                                langCode="hi"
                                onPlay={() => playSpeech(translations.hi, 'hi')}
                                color="border-l-[#FF9933]"
                                fontFamily="font-hindi"
                            />

                            {/* Card Punjabi */}
                            <TranslationCard
                                label="Punjabi / ਪੰਜਾਬी"
                                text={translations.pa}
                                langCode="pa"
                                onPlay={() => playSpeech(translations.pa, 'pa')}
                                color="border-l-[#D2122E]"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Info Note */}
                {!translations && !isLoading && (
                    <div className="text-center py-12 px-8">
                        <div className="inline-flex p-4 bg-orange-50 rounded-full mb-4">
                            <Volume2 className="text-orange-400" size={32} />
                        </div>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed">
                            Habla o escribe para traducir instantáneamente entre los idiomas de nuestra unión.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}

function TranslationCard({ label, text, onPlay, color, fontFamily = '' }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 border-l-[6px] ${color}`}
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{label}</span>
                <button
                    onClick={onPlay}
                    className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-primary/10 hover:text-primary transition-all active:scale-90"
                >
                    <Volume2 size={20} />
                </button>
            </div>
            <p className={`text-xl font-bold text-slate-800 leading-tight ${fontFamily}`}>
                {text}
            </p>
        </motion.div>
    );
}
