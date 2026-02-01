'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { SPAIN_GUIDE_DATA, SpainGuideCategory } from '@/data/spain-guide';
import { CheckCircle2, Bookmark } from 'lucide-react';
import { addToChecklist, getChecklist, deleteChecklistItem } from '@/lib/actions/checklist-actions';
import { toast } from 'sonner';

export default function InfoSpain() {
    const t = useTranslations('InfoHub.spain_guide');
    const tToast = useTranslations('Profile.checklist_toast');
    const [activeTabId, setActiveTabId] = useState<string>(SPAIN_GUIDE_DATA[0].id);
    const [userChecklistIds, setUserChecklistIds] = useState<Set<string>>(new Set());
    const [isSyncing, setIsSyncing] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
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

    const activeCategory = SPAIN_GUIDE_DATA.find(cat => cat.id === activeTabId);

    const handleTabClick = (id: string) => {
        setActiveTabId(id);
        const element = document.getElementById(`tab-spain-${id}`);
        if (element && scrollRef.current) {
            scrollRef.current.scrollTo({
                left: element.offsetLeft - 24,
                behavior: 'smooth'
            });
        }
    };

    const handleToggleChecklist = async (itemId: string, itemTitle: string, categoryId: string) => {
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
                toast(tToast('removed'));
            } else {
                await addToChecklist({
                    itemId,
                    itemTitle,
                    category: t(`categories.${categoryId}`)
                });
                setUserChecklistIds(prev => new Set(prev).add(itemId));
                toast.success(tToast('added'), {
                    icon: '📋',
                    description: tToast('added_desc')
                });
            }
        } catch (error) {
            toast.error(tToast('error'));
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
                    {SPAIN_GUIDE_DATA.map((cat) => (
                        <button
                            key={cat.id}
                            id={`tab-spain-${cat.id}`}
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
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12"
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
                                    {/* Image Section */}
                                    <div className="relative aspect-square w-full p-6 flex items-center justify-center bg-transparent">
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={item.image}
                                                alt={t(`${activeTabId}.${item.id}.title`)}
                                                fill
                                                className="object-contain drop-shadow-2xl translate-y-2"
                                                priority={idx < 2}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = '/InfoSpain/Icono_Pasaporte.png';
                                                }}
                                            />
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
                                            {item.meta?.map((m, mIdx) => (
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
