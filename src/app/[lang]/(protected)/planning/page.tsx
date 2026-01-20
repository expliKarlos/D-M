'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { Map, Info, Calendar, User, ArrowLeft, Navigation } from 'lucide-react';
import InfoIndia from './InfoIndia';
import InfoUtil from './InfoUtil';
import Agenda from './Agenda';
import MisDatos from './MisDatos';
import PlanningMandala from '@/components/shared/PlanningMandala';
import SwipeProvider from '@/components/shared/SwipeProvider';

type Tab = 'india' | 'util' | 'agenda' | 'mis-datos';

function PlanningContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const rawTab = searchParams.get('tab');
    const activeTab = (rawTab as Tab) || null;

    const tabs = [
        { id: 'india', label: 'Info India', icon: <Map size={18} /> },
        { id: 'util', label: 'Info Útil', icon: <Info size={18} /> },
        { id: 'agenda', label: 'Agenda', icon: <Calendar size={18} /> },
        { id: 'mis-datos', label: 'Mis Datos', icon: <User size={18} /> },
    ];

    const handleNavigate = (id: string) => {
        router.push(`?tab=${id}`, { scroll: false });
    };

    const handleBack = () => {
        router.push('?', { scroll: false });
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'india': return <InfoIndia />;
            case 'util': return <InfoUtil />;
            case 'agenda': return <Agenda />;
            case 'mis-datos': return <MisDatos />;
            default: return null;
        }
    };

    const activeTabData = tabs.find(t => t.id === activeTab);

    return (
        <main className="min-h-screen bg-[#fafafa] relative overflow-x-hidden">
            {/* 
        Shared Element Backdrop: 
        The Mandala Circle expands into the header background 
      */}
            <AnimatePresence>
                {activeTab && (
                    <motion.div
                        layoutId="mandala-backdrop"
                        className="fixed top-0 left-0 right-0 h-24 bg-white/80 backdrop-blur-2xl border-b border-slate-100 z-10"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation Header (Conditional) */}
            <AnimatePresence>
                {activeTab && (
                    <header className="fixed top-0 inset-x-0 z-30 px-6 py-4 flex items-center justify-between">
                        <button
                            onClick={handleBack}
                            className="p-2.5 bg-white rounded-full shadow-lg border border-slate-100 text-primary active:scale-90 transition-transform flex items-center justify-center relative group"
                        >
                            {/* The Traveling Icon Effect */}
                            <motion.div
                                layoutId={`icon-bg-${activeTab}`}
                                className="absolute inset-0 bg-primary/5 rounded-full -z-10 group-hover:bg-primary/10 transition-colors"
                            />
                            <motion.div layoutId={`icon-${activeTab}`}>
                                <ArrowLeft size={20} />
                            </motion.div>
                        </button>

                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-lg font-cinzel font-bold text-slate-900 absolute left-20"
                        >
                            {activeTabData?.label || 'Planning'}
                        </motion.h1>

                        <div className="flex gap-2">
                            {tabs.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => handleNavigate(t.id)}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${activeTab === t.id ? 'bg-primary border-primary text-white shadow-md' : 'bg-white border-slate-100 text-slate-400'
                                        }`}
                                >
                                    {React.cloneElement(t.icon as any, { size: 16 })}
                                </button>
                            ))}
                        </div>
                    </header>
                )}
            </AnimatePresence>

            {/* Initial View: Full Mandala */}
            <AnimatePresence mode="wait">
                {!activeTab ? (
                    <motion.div
                        key="mandala-view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-screen flex flex-col items-center justify-center px-10 relative"
                    >
                        <div className="text-center mb-20 space-y-4">
                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-5xl font-cinzel font-bold text-slate-900 leading-tight"
                            >
                                Plan de <br /> <span className="text-saffron-metallic underline decoration-saffron/20">Aventura</span>
                            </motion.h2>
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-slate-400 text-sm font-medium tracking-wide italic"
                            >
                                Selecciona un cuadrante para explorar los rituales.
                            </motion.p>
                        </div>

                        <PlanningMandala onNavigate={handleNavigate} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="content-view"
                        className="pt-24 px-6 pb-40 overflow-y-auto h-screen scroll-smooth"
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
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                >
                                    {renderContent()}
                                </motion.div>
                            </AnimatePresence>
                        </SwipeProvider>

                        {/* Collapsed Mandala for Navigation */}
                        <div className="fixed bottom-10 right-10 z-40">
                            <PlanningMandala
                                activeTab={activeTab}
                                onNavigate={handleNavigate}
                                isCollapsed={true}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}

export default function PlanningPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center font-cinzel text-slate-300">Cargando Mandala...</div>}>
            <PlanningContent />
        </Suspense>
    );
}
