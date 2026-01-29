'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { INDIA_GUIDE_DATA } from '@/data/india-guide';
import { Check, CalendarCheck, CalendarPlus } from 'lucide-react';
import { toast } from 'sonner';
import { addToChecklist, getChecklist } from '@/lib/actions/checklist-actions';

export default function InfoIndia() {
    const t = useTranslations('InfoHub.india_tips.guide');
    const [activeTabId, setActiveTabId] = useState<string>(INDIA_GUIDE_DATA[0].id);
    const [checklistItems, setChecklistItems] = useState<Set<string>>(new Set());
    const tabsRef = useRef<HTMLDivElement>(null);

    const activeCategory = INDIA_GUIDE_DATA.find(c => c.id === activeTabId) || INDIA_GUIDE_DATA[0];

    useEffect(() => {
        // Fetch existing checklist items to show state
        async function fetchChecklist() {
            try {
                const items = await getChecklist();
                const ids = new Set(items.map(i => i.item_id));
                setChecklistItems(ids);
            } catch (err) {
                console.error('Failed to load checklist status', err);
            }
        }
        fetchChecklist();
    }, []);

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

    const handleChecklistToggle = async (itemId: string, itemTitle: string, category: string) => {
        const isAdded = checklistItems.has(itemId);

        // Optimistic update
        setChecklistItems(prev => {
            const next = new Set(prev);
            if (!isAdded) next.add(itemId);
            // We only support ADDING for now as requested, but visual toggle suggests we might want to support removing?
            // "Si el usuario lo pulsa, cambiar a checklist activado" suggests mostly one-way interaction in this view, 
            // but usually toggle is better UX. I will implement ADD-only for simplicity and safety unless requested otherwise,
            // or maybe I can skip remove action here to avoid accidental removals? 
            // The prompt says "Si el usuario lo pulsa, cambiar a checklist activado." - doesn't explicitly say "desactivado".
            // Adding is safe. Removing might require confirmation. Let's just track "Added" visibly.
            return next;
        });

        if (isAdded) {
            // If already added, just notify
            toast.info('Ya está en tu lista', { description: itemTitle });
            return;
        }

        try {
            await addToChecklist({ itemId, itemTitle, category });
            toast.success(t('tabs.add_success') || 'Añadido a tus preparativos', {
                description: itemTitle,
                icon: <Check size={16} className="text-green-500" />
            });
        } catch (error) {
            // Revert on error
            setChecklistItems(prev => {
                const next = new Set(prev);
                next.delete(itemId);
                return next;
            });
            toast.error('Error al guardar');
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
                            const isAdded = checklistItems.has(item.id);

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
                                    {/* Image Container - UPDATED: Transparent, Square, No Frame */}
                                    <div className="w-full md:w-1/2 flex justify-center p-4">
                                        <div className="relative w-full max-w-xs aspect-square">
                                            <Image
                                                src={item.image}
                                                alt={title}
                                                fill
                                                className="object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500"
                                                sizes="(max-width: 768px) 100vw, 50vw"
                                            />
                                        </div>
                                    </div>

                                    {/* Text Container */}
                                    <div className="w-full md:w-1/2 space-y-3 relative">
                                        <div className="flex items-start justify-between gap-4">
                                            <h3 className="text-2xl font-cinzel font-bold text-slate-800 leading-tight flex-1">
                                                {title}
                                            </h3>

                                            {/* Checklist Header Button */}
                                            <button
                                                onClick={() => handleChecklistToggle(item.id, title, activeCategory.id)}
                                                className={`
                                                    p-2 rounded-full transition-all duration-300 shadow-sm border
                                                    ${isAdded
                                                        ? 'bg-green-100 text-green-600 border-green-200'
                                                        : 'bg-white text-slate-400 border-slate-100 hover:text-primary hover:border-primary/30'
                                                    }
                                                `}
                                                title={isAdded ? 'Añadido' : 'Añadir a mi lista'}
                                            >
                                                {isAdded ? <Check size={20} strokeWidth={3} /> : <CalendarPlus size={20} />}
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
