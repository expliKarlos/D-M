'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, ChevronRight, Map, Calendar, Plus, Trash2 } from 'lucide-react';
import { useMergedAgenda } from '@/hooks/useMergedAgenda';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import AddEventModal from '@/components/itinerary/AddEventModal';
import { db, auth } from '@/lib/services/firebase';
import { doc, deleteDoc } from 'firebase/firestore';

export default function Agenda() {
    const t = useTranslations('Agenda');
    const { eventsByDate, isLoading } = useMergedAgenda();
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const params = useParams();
    const lang = params?.lang || 'es';

    const dates = useMemo(() => Object.keys(eventsByDate).sort(), [eventsByDate]);

    useEffect(() => {
        if (dates.length > 0 && !selectedDate) {
            const today = new Date().toISOString().split('T')[0];
            setSelectedDate(dates.includes(today) ? today : dates[0]);
        }
    }, [dates, selectedDate]);

    const activeEvents = selectedDate ? eventsByDate[selectedDate] : [];

    const handleDeletePersonal = async (id: string) => {
        const user = auth.currentUser;
        if (!user) return;
        if (!window.confirm(t('delete_confirm'))) return;

        try {
            await deleteDoc(doc(db, 'users', user.uid, 'personal_itinerary', id));
        } catch (error) {
            console.error('Error deleting personal plan:', error);
        }
    };

    const formatDateCapsule = (dateStr: string) => {
        const d = new Date(dateStr + 'T00:00:00');
        const day = d.getDate();
        const month = d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : lang === 'es' ? 'es-ES' : 'en-US', { month: 'short' }).replace('.', '');
        return { day, month };
    };

    if (isLoading) {
        return (
            <div className="py-20 flex justify-center">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="pb-20">
            {/* Cápsulas de Fecha - Scroll Horizontal Sticky al Header de Planning */}
            <div className="sticky top-[-24px] z-20 bg-white/50 backdrop-blur-md mb-8 -mx-6 px-6 py-4 border-b border-slate-100 overflow-hidden">
                <div className="flex overflow-x-auto hide-scrollbar gap-3 snap-x">
                    {dates.map((dateStr) => {
                        const { day, month } = formatDateCapsule(dateStr);
                        const isSelected = selectedDate === dateStr;

                        return (
                            <button
                                key={dateStr}
                                onClick={() => setSelectedDate(dateStr)}
                                className={cn(
                                    "flex flex-col items-center justify-center min-w-[60px] h-16 rounded-2xl transition-all duration-300 border snap-center",
                                    isSelected
                                        ? "bg-slate-900 border-slate-900 text-white shadow-xl -translate-y-1"
                                        : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                                )}
                            >
                                <span className="text-lg font-cinzel font-bold leading-none mb-1">{day}</span>
                                <span className="text-[9px] font-bold uppercase tracking-widest opacity-80">{month}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={selectedDate}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={{
                        visible: { transition: { staggerChildren: 0.1 } }
                    }}
                    className="space-y-6"
                >
                    {activeEvents.map((event) => {
                        const titleFont = event.isOfficial ? 'font-[Cinzel]' : 'font-sans';
                        const subtitleFont = lang === 'hi' || event.country === 'India' ? 'font-[Tiro_Devanagari_Hindi]' : (event.isOfficial ? 'font-[Cinzel]' : 'font-outfit');

                        return (
                            <motion.div
                                key={event.id}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                                className="relative bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                            >
                                <div className={cn(
                                    "absolute top-0 left-0 bottom-0 w-1.5",
                                    event.isOfficial ? "bg-[#D4AF37]" : "bg-slate-400"
                                )} />

                                <div className="p-6 pl-8">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
                                                <Clock size={12} className="opacity-70" />
                                                <span className={event.isOfficial ? "text-[#D4AF37]" : "text-slate-400"}>
                                                    {event.time}
                                                </span>
                                                {!event.isOfficial && (
                                                    <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[8px] tracking-normal uppercase">{t('my_plan')}</span>
                                                )}
                                            </div>
                                            <h3 className={cn(titleFont, "text-lg font-bold text-slate-900 leading-tight")}>
                                                {event.title}
                                            </h3>
                                            <p className={cn(subtitleFont, "text-xs text-slate-500 opacity-80")}>
                                                {event.location}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {!event.isOfficial && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeletePersonal(event.id);
                                                    }}
                                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                            <div className={cn(
                                                "p-3 rounded-2xl",
                                                event.isOfficial ? "bg-[#D4AF37]/5 text-[#D4AF37]" : "bg-slate-50 text-slate-400"
                                            )}>
                                                {event.isOfficial ? <Calendar size={18} /> : <Clock size={18} />}
                                            </div>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {expandedId === event.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <p className="text-slate-600 text-sm leading-relaxed pt-4 border-t border-slate-50 mt-4 font-outfit">
                                                    {event.description}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="flex items-center gap-2 pt-6 mt-2 border-t border-slate-50">
                                        <button
                                            onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl text-xs font-bold transition-all"
                                        >
                                            {expandedId === event.id ? t('close') : t('view_details')}
                                            <ChevronRight size={14} className={cn("transition-transform", expandedId === event.id && "rotate-90")} />
                                        </button>

                                        {event.coordinates && (
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${event.coordinates.lat},${event.coordinates.lng}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2.5 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-200 active:scale-95 transition-transform"
                                            >
                                                <Map size={18} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </AnimatePresence>

            {/* FAB: Añadir Plan Personal (Ajustado para el Tab) */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-24 right-6 w-14 h-14 bg-slate-900 text-white rounded-2xl shadow-2xl z-40 border border-white/20 flex items-center justify-center"
            >
                <Plus size={28} />
            </motion.button>

            <AddEventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialDate={selectedDate}
            />
        </div>
    );
}
