'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Map, Info, Calendar, User, ChevronLeft } from 'lucide-react';
import InfoIndia from './InfoIndia';
import InfoUtil from './InfoUtil';
import Agenda from './Agenda';
import MisDatos from './MisDatos';
import { Link } from '@/i18n/navigation';
import { useParams } from 'next/navigation';

type Tab = 'india' | 'util' | 'agenda' | 'mis-datos';

export default function PlanningPage() {
    const [activeTab, setActiveTab] = useState<Tab>('agenda');
    const params = useParams();
    const lang = params.lang as string;

    const tabs = [
        { id: 'india', label: 'Info India', icon: <Map size={18} /> },
        { id: 'util', label: 'Info Útil', icon: <Info size={18} /> },
        { id: 'agenda', label: 'Agenda', icon: <Calendar size={18} /> },
        { id: 'mis-datos', label: 'Mis Datos', icon: <User size={18} /> },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'india': return <InfoIndia />;
            case 'util': return <InfoUtil />;
            case 'agenda': return <Agenda />;
            case 'mis-datos': return <MisDatos />;
            default: return <Agenda />;
        }
    };

    return (
        <main className="min-h-screen bg-[#fafafa] pb-32">
            {/* Navigation Header */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                <Link href="/" className="p-2 rounded-full hover:bg-slate-50 transition-colors">
                    <ChevronLeft size={20} className="text-slate-600" />
                </Link>
                <h1 className="text-lg font-cinzel font-bold text-slate-900">Planning Hub</h1>
                <div className="w-9" /> {/* Spacer */}
            </header>

            {/* Hero Section */}
            <div className="px-6 pt-8 pb-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-tr from-saffron/10 via-teal/5 to-white rounded-[2.5rem] p-8 border border-white shadow-sm overflow-hidden relative"
                >
                    <div className="absolute top-0 right-0 w-40 h-40 bg-saffron/5 blur-3xl rounded-full" />
                    <h2 className="text-4xl font-cinzel font-bold text-slate-900 mb-2 leading-tight">
                        Nuestra <br /> <span className="text-saffron-metallic">India</span> Real
                    </h2>
                    <p className="text-slate-500 text-sm italic tracking-wide">
                        Todo lo que necesitas para el viaje de tu vida.
                    </p>
                </motion.div>
            </div>

            {/* Tabs */}
            <nav className="px-6 py-4 sticky top-[68px] z-20 bg-[#fafafa]/80 backdrop-blur-sm">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-xs whitespace-nowrap transition-all border ${activeTab === tab.id
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105'
                                    : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
                                }`}
                        >
                            {tab.icon}
                            <span className="font-cinzel">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </nav>

            {/* Content Area */}
            <div className="px-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </main>
    );
}
