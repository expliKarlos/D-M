'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { INDIA_GUIDE_DATA, GuideCategory } from '@/data/india-guide';
import { ChevronRight, ChevronLeft, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';
import { addToChecklist } from '@/lib/actions/checklist-actions';

export default function InfoIndia() {
    const t = useTranslations('InfoHub.india_tips.guide');
    const [activeTabId, setActiveTabId] = useState<string>(INDIA_GUIDE_DATA[0].id);
    const tabsRef = useRef<HTMLDivElement>(null);

    const activeCategory = INDIA_GUIDE_DATA.find(c => c.id === activeTabId) || INDIA_GUIDE_DATA[0];

    const scrollToTab = (tabId: string) => {
        const tabElement = document.getElementById(`tab-${tabId}`);
        if (tabElement && tabsRef.current) {
            const container = tabsRef.current;
            const scrollLeft = tabElement.offsetLeft - container.offsetWidth / 2 + tabElement.offsetWidth / 2;
            container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
    };

    const handleTabClick = (id: string) => {
        setActiveTabId(id);
        scrollToTab(id);
    };

    const handleAddToChecklist = async (itemId: string, itemTitle: string, category: string) => {
        try {
            await addToChecklist({ itemId, itemTitle, category });
            toast.success(t('tabs.add_success') || 'Añadido a tus preparativos personales', {
                description: itemTitle,
                icon: <Check size={16} className="text-green-500" />
            });
        } catch (error) {
            toast.error('Error', {
                description: 'Inicia sesión para guardar items'
            });
        }
    };

    return (
        <div className="min-h-screen pb-20 bg-[#fafafa]">
            {/* Sticky Sub-Header for Tabs */}
            <div className="sticky top-20 z-20 bg-[#fafafa]/95 backdrop-blur-sm border-b border-slate-200 py-2 shadow-sm">
                <div
                    ref={tabsRef}
                    className="flex overflow-x-auto gap-3 px-4 no-scrollbar items-center"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {INDIA_GUIDE_DATA.map((cat) => {
                        const isActive = activeTabId === cat.id;
                        return (
                            <button
                                key={cat.id}
                                id={`tab-${cat.id}`}
                                onClick={() => handleTabClick(cat.id)}
                                className={`
                                    whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                                    ${isActive
                                        ? 'bg-primary text-white shadow-md scale-105'
                                        : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                                    }
                                `}
                            >
                                {t(`tabs.${cat.id}`)}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-4xl mx-auto px-4 py-8 overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTabId}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-12"
                    >
                        {activeCategory.items.map((item, index) => {
                            const isEven = index % 2 === 0;
                            const title = t(`${activeCategory.id}.${item.id}.title`);
                            const text = t(`${activeCategory.id}.${item.id}.text`);

                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    className={`
                                        flex flex-col md:flex-row gap-6 md:gap-10 items-center
                                        ${!isEven ? 'md:flex-row-reverse' : ''}
                                    `}
                                >
                                    {/* Image Container */}
                                    <div className="w-full md:w-1/2 relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg group">
                                        <Image
                                            src={item.image}
                                            alt={title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                                        {/* Floating Action Button inside Image */}
                                        <button
                                            onClick={() => handleAddToChecklist(item.id, title, activeCategory.id)}
                                            className="absolute bottom-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full text-primary shadow-lg hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                                            title="Añadir a mi lista"
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>

                                    {/* Text Container */}
                                    <div className="w-full md:w-1/2 space-y-3 relative group/text">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="text-2xl font-cinzel font-bold text-slate-800 leading-tight">
                                                {title}
                                            </h3>

                                            {/* Mobile-visible Button (or always visible as secondary option) */}
                                            <button
                                                onClick={() => handleAddToChecklist(item.id, title, activeCategory.id)}
                                                className="md:hidden p-2 text-primary hover:bg-primary/5 rounded-full transition-colors"
                                            >
                                                <Plus size={20} />
                                            </button>
                                        </div>

                                        <div className="h-1 w-20 bg-saffron rounded-full mb-4" />
                                        <p className="text-slate-600 leading-relaxed text-base font-light">
                                            {text}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
