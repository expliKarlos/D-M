'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { Sparkles, Image as ImageIcon, Gamepad2, ArrowLeft } from 'lucide-react';
import ParticipaMandala from '@/components/shared/ParticipaMandala';
import HoliParticles from '@/components/shared/HoliParticles';
import SwipeProvider from '@/components/shared/SwipeProvider';
import MuroDeseos from './MuroDeseos';
import GaleriaFotos from './GaleriaFotos';
import ZonaJuegos from './ZonaJuegos';

type Tab = 'muro' | 'galeria' | 'juegos';

function ParticipationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const rawTab = searchParams.get('tab');
    const activeTab = (rawTab as Tab) || null;

    const rotation = useMotionValue(0);

    const tabs = [
        { id: 'muro', label: 'Muro', icon: <Sparkles size={18} /> },
        { id: 'galeria', label: 'Galería', icon: <ImageIcon size={18} /> },
        { id: 'juegos', label: 'Juegos', icon: <Gamepad2 size={18} /> },
    ];

    const handleNavigate = (id: string) => {
        router.push(`?tab=${id}`, { scroll: false });
    };

    const handleBack = () => {
        router.push('?', { scroll: false });
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'muro': return <MuroDeseos />;
            case 'galeria': return <GaleriaFotos />;
            case 'juegos': return <ZonaJuegos />;
            default: return null;
        }
    };

    const activeTabData = tabs.find(t => t.id === activeTab);

    useEffect(() => {
        if (activeTab && typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(12);
        }
    }, [activeTab]);

    return (
        <main className="min-h-screen bg-[#fffcf9] relative overflow-x-hidden selection:bg-[#F21B6A]/20">
            <HoliParticles rotationValue={rotation} />

            <AnimatePresence>
                {activeTab && (
                    <motion.div
                        layoutId="holi-backdrop"
                        className="fixed top-0 left-0 right-0 h-24 bg-white/60 backdrop-blur-2xl border-b border-fuchsia-100 z-10 shadow-sm"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {activeTab && (
                    <header className="fixed top-0 inset-x-0 z-30 px-6 py-4 flex items-center justify-between">
                        <button
                            onClick={handleBack}
                            className="p-2.5 bg-white rounded-full shadow-lg border border-fuchsia-50 text-[#F21B6A] active:scale-90 transition-transform flex items-center justify-center relative group"
                        >
                            <ArrowLeft size={20} />
                        </button>

                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-xl font-fredoka font-bold text-slate-800 absolute left-20"
                        >
                            {activeTabData?.label}
                        </motion.h1>

                        <div className="flex gap-2">
                            {tabs.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => handleNavigate(t.id)}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${activeTab === t.id
                                        ? 'bg-gradient-to-r from-[#FF6B35] to-[#F21B6A] border-white text-white shadow-md scale-110'
                                        : 'bg-white border-fuchsia-50 text-slate-300'
                                        }`}
                                >
                                    {React.cloneElement(t.icon as any, { size: 16 })}
                                </button>
                            ))}
                        </div>
                    </header>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {!activeTab ? (
                    <motion.div
                        key="holi-view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-screen flex flex-col items-center justify-center px-10 relative z-20"
                    >
                        <div className="text-center mb-20 space-y-4">
                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-5xl font-fredoka font-bold text-slate-900 leading-tight"
                            >
                                Festival de <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] via-[#F21B6A] to-[#FFD100]">Colores</span>
                            </motion.h2>
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-slate-500 text-sm font-outfit font-medium tracking-wide"
                            >
                                Descubre la magia de la boda participando.
                            </motion.p>
                        </div>

                        <ParticipaMandala
                            onNavigate={handleNavigate}
                            rotationValue={rotation}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="holi-content-view"
                        className="pt-24 px-6 pb-40 overflow-y-auto h-screen scroll-smooth relative z-20"
                        style={{ WebkitOverflowScrolling: 'touch' }}
                    >
                        <SwipeProvider
                            activeTab={activeTab}
                            tabs={tabs}
                            onNavigate={handleNavigate}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    {renderContent()}
                                </motion.div>
                            </AnimatePresence>
                        </SwipeProvider>

                        <div className="fixed bottom-10 right-10 z-40">
                            <ParticipaMandala
                                activeTab={activeTab}
                                onNavigate={handleNavigate}
                                isCollapsed={true}
                                rotationValue={rotation}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}

export default function ParticipatePage() {
    return (
        <React.Suspense fallback={<div className="h-screen flex items-center justify-center font-fredoka text-fuchsia-300">Cargando Experiencia...</div>}>
            <ParticipationContent />
        </React.Suspense>
    );
}
