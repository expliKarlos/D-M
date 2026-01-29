'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { INDIA_GUIDE_DATA, GuideCategory } from '@/data/india-guide';
import { ChevronRight, ChevronLeft, Bookmark, CheckCircle2 } from 'lucide-react';
import { addToChecklist, getChecklist, deleteChecklistItem } from '@/lib/actions/checklist-actions';
import { toast } from 'sonner';

export default function InfoIndia() {
    const t = useTranslations('InfoHub.india_tips.guide');
    const [activeTabId, setActiveTabId] = useState<string>(INDIA_GUIDE_DATA[0].id);
    const [userChecklistIds, setUserChecklistIds] = useState<Set<string>>(new Set());
    const [isSyncing, setIsSyncing] = useState(false);

    // Scroll handling for tabs
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load user checklist to show "already added" state
        const loadChecklist = async () => {
            try {
                const data = await getChecklist();
                setUserChecklistIds(new Set(data.map(i => i.item_id)));
            } catch (error) {
                console.error('Error loading checklist:', error);
            }
        };
        loadChecklist();
    }, []);

    const activeCategory = INDIA_GUIDE_DATA.find(cat => cat.id === activeTabId);

    const handleTabClick = (id: string) => {
        setActiveTabId(id);
        const element = document.getElementById(`tab-${id}`);
        if (element && scrollRef.current) {
            scrollRef.current.scrollTo({
                left: element.offsetLeft - 24,
                behavior: 'smooth'
            });
        }
    };

    const handleToggleChecklist = async (itemId: string, itemTitle: string, category: string) => {
        if (isSyncing) return;
        setIsSyncing(true);

        const isAdded = userChecklistIds.has(itemId);

        try {
            if (isAdded) {
                await deleteChecklistItem(itemId);
                setUserChecklistIds(prev => {
                    const next = new Set(prev);
                    next.delete(itemId);
                    return next;
                });
                toast('Eliminado de tus tareas');
            } else {
                await addToChecklist({
                    itemId,
                    itemTitle,
                    category: t(`categories.${category}`)
                });
                setUserChecklistIds(prev => new Set(prev).add(itemId));
                toast.success('¡Añadido a tus tareas personales!', {
                    icon: '📋',
                    description: 'Puedes verlo en tu Perfil'
                });
            }
        } catch (error) {
            toast.error('Error al sincronizar lista');
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Horizontal Categories Nav */}
            <div className="relative">
                <div
                    ref={scrollRef}
                    className="flex gap-2 overflow-x-auto pb-4 px-6 no-scrollbar scroll-smooth"
                >
                    {INDIA_GUIDE_DATA.map((cat) => (
                        <button
                            key={cat.id}
                            id={`tab-${cat.id}`}
                            onClick={() => handleTabClick(cat.id)}
                            className={`
                                whitespace-nowrap px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 border
                                ${activeTabId === cat.id
                                    ? 'bg-[#FF9933] text-white border-[#FF9933] shadow-lg shadow-orange-500/20 scale-105'
                                    : 'bg-white text-slate-400 border-slate-100 hover:border-orange-200'
                                }
                            `}
                        >
                            {t(`categories.${cat.id}`)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Category Content */}
            <div className="px-6 space-y-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTabId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6 pb-12"
                    >
                        {activeCategory?.items.map((item, idx) => {
                            const isAdded = userChecklistIds.has(item.id);

                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white rounded-[2rem] shadow-sm border border-slate-50 overflow-hidden flex flex-col"
                                >
                                    {/* Image Section - 1:1, Transparent, No Border */}
                                    <div className="relative aspect-square w-full p-6 flex items-center justify-center bg-transparent">
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={item.image}
                                                alt={t(`${activeTabId}.${item.id}.title`)}
                                                fill
                                                className="object-contain drop-shadow-2xl translate-y-2 group-hover:scale-105 transition-transform duration-700"
                                                priority={idx < 2}
                                            />
                                        </div>

                                        <div className="absolute top-6 right-6 flex flex-col gap-2">
                                            <div className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm text-[8px] font-black text-slate-400 uppercase tracking-widest border border-white/50">
                                                Tip #0{idx + 1}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-8 pt-2">
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <h3 className="text-xl font-black text-slate-900 leading-tight">
                                                {t(`${activeTabId}.${item.id}.title`)}
                                            </h3>

                                            <button
                                                onClick={() => handleToggleChecklist(item.id, t(`${activeTabId}.${item.id}.title`), activeTabId)}
                                                disabled={isSyncing}
                                                className={`
                                                    shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500
                                                    ${isAdded
                                                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                                                        : 'bg-slate-50 text-slate-300 hover:text-orange-500 hover:bg-orange-50'
                                                    }
                                                    ${isSyncing ? 'opacity-50 grayscale' : ''}
                                                `}
                                            >
                                                {isAdded ? (
                                                    <CheckCircle2 size={24} strokeWidth={3} />
                                                ) : (
                                                    <Bookmark size={24} />
                                                )}
                                            </button>
                                        </div>

                                        <p className="text-slate-500 text-sm leading-relaxed mb-6">
                                            {t(`${activeTabId}.${item.id}.description`)}
                                        </p>

                                        {/* Key Info Pills */}
                                        <div className="flex flex-wrap gap-2">
                                            {INDIA_GUIDE_DATA.find(c => c.id === activeTabId)?.items.find(i => i.id === item.id)?.meta?.map((m: any, mIdx: number) => (
                                                <div
                                                    key={mIdx}
                                                    className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl text-[10px] font-bold text-slate-500 border border-slate-100"
                                                >
                                                    <span className="material-symbols-outlined text-[14px] text-orange-400">{m.icon}</span>
                                                    {t(`${activeTabId}.${item.id}.meta.${m.id}`)}
                                                </div>
                                            ))}
                                        </div>
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
