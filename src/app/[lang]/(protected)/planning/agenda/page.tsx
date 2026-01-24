'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Clock, ChevronRight, Info, Map, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useAgendaData, AgendaEvent } from '@/hooks/useAgendaData';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import AddEventModal from '@/components/itinerary/AddEventModal';
import { db, auth } from '@/lib/services/firebase';
import { doc, deleteDoc } from 'firebase/firestore';

export default function PremiumAgendaPage() {
    const { eventsByDate, isLoading } = useAgendaData();
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const params = useParams();
    const router = useRouter();
    const lang = params?.lang || 'es';

    const handleDeletePersonal = async (id: string) => {
        const user = auth.currentUser;
        if (!user) return;
        if (!window.confirm('¿Quieres eliminar este plan personal?')) return;

        try {
            await deleteDoc(doc(db, 'users', user.uid, 'personal_agenda', id));
        } catch (error) {
            console.error('Error deleting personal event:', error);
        }
    };

    // ... unique dates logic

    // Obtener fechas únicas ordenadas
    const dates = useMemo(() => Object.keys(eventsByDate).sort(), [eventsByDate]);

    // Establecer fecha inicial (hoy si existe, o la primera disponible)
    useEffect(() => {
        if (dates.length > 0 && !selectedDate) {
            const today = new Date().toISOString().split('T')[0];
            if (dates.includes(today)) {
                setSelectedDate(today);
            } else {
                setSelectedDate(dates[0]);
            }
        }
    }, [dates, selectedDate]);

    const activeEvents = selectedDate ? eventsByDate[selectedDate] : [];

    // Formateo de fecha para las cápsulas
    const formatDateCapsule = (dateStr: string) => {
        const d = new Date(dateStr + 'T00:00:00');
        const day = d.getDate();
        const month = d.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { month: 'short' }).replace('.', '');
        return { day, month };
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
                    <p className="text-slate-400 font-cinzel text-sm animate-pulse">Cargando Agenda...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#fafafa] pb-20">
            {/* Header / Navigation */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-lg font-cinzel font-bold text-slate-900">Agenda Real</h1>
                <div className="w-9" /> {/* Spacer */}
            </header>

            {/* Date Capsules - Horizontal Navigation */}
            <div className="sticky top-[61px] z-30 bg-white/50 backdrop-blur-sm border-b border-slate-100 overflow-hidden shadow-sm">
                <div className="flex overflow-x-auto hide-scrollbar px-6 py-5 gap-3 snap-x">
                    {dates.map((dateStr) => {
                        const { day, month } = formatDateCapsule(dateStr);
                        const isSelected = selectedDate === dateStr;

                        return (
                            <button
                                key={dateStr}
                                onClick={() => setSelectedDate(dateStr)}
                                className={cn(
                                    "flex flex-col items-center justify-center min-w-[64px] h-20 rounded-2xl transition-all duration-300 border snap-center",
                                    isSelected
                                        ? "bg-slate-900 border-slate-900 text-white shadow-lg -translate-y-1"
                                        : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                                )}
                            >
                                <span className="text-xl font-cinzel font-bold">{day}</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{month}</span>
                                {isSelected && (
                                    <motion.div
                                        layoutId="pill-indicator"
                                        className="absolute -bottom-1 w-1 h-1 bg-white rounded-full"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Event List */}
            <div className="max-w-xl mx-auto px-6 py-10">
                <AnimatePresence mode="wait">
                    {activeEvents.length > 0 ? (
                        <motion.div
                            key={selectedDate}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            variants={{
                                visible: { transition: { staggerChildren: 0.1 } }
                            }}
                            className="space-y-4"
                        >
                            {activeEvents.map((event) => (
                                <motion.div
                                    key={event.id}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: { opacity: 1, y: 0 }
                                    }}
                                    className="relative bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                                >
                                    {/* Lateral Color Bar */}
                                    <div className={cn(
                                        "absolute top-0 left-0 bottom-0 w-1.5",
                                        event.isOfficial ? "bg-[#D4AF37]" : "bg-blue-600"
                                    )} />

                                    <div className="p-6 pl-8">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                                    <Clock size={12} className="opacity-50" />
                                                    <span>{event.time}</span>
                                                    {!event.isOfficial && (
                                                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[8px] ml-1">PERSONAL</span>
                                                    )}
                                                </div>
                                                <h3 className={cn(
                                                    "text-lg leading-tight",
                                                    event.isOfficial ? "font-cinzel font-bold text-slate-900" : "font-sans font-semibold text-slate-700"
                                                )}>
                                                    {event.title}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {!event.isOfficial && (
                                                    <button
                                                        onClick={() => handleDeletePersonal(event.id)}
                                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                                <div className={cn(
                                                    "p-3 rounded-2xl",
                                                    event.isOfficial ? "bg-[#D4AF37]/5 text-[#D4AF37]" : "bg-blue-50 text-blue-600"
                                                )}>
                                                    {event.isOfficial ? <Calendar size={18} /> : <Info size={18} />}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                                <MapPin size={14} className="opacity-40" />
                                                <span className="truncate">{event.location}</span>
                                            </div>

                                            <AnimatePresence>
                                                {expandedId === event.id && event.description && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <p className="text-slate-500 text-sm leading-relaxed pt-2 border-t border-slate-50 mt-2 font-outfit">
                                                            {event.description}
                                                        </p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                                                <button
                                                    onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
                                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-all group-hover:bg-slate-100"
                                                >
                                                    {expandedId === event.id ? 'Cerrar' : 'Ver detalles'}
                                                    <ChevronRight size={14} className={cn(
                                                        "transition-all",
                                                        expandedId === event.id ? "rotate-90" : "opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0"
                                                    )} />
                                                </button>
                                                {event.coordinates && (
                                                    <a
                                                        href={`https://www.google.com/maps/search/?api=1&query=${event.coordinates.lat},${event.coordinates.lng}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2.5 bg-slate-900 text-white rounded-xl shadow-sm active:scale-95 transition-transform"
                                                    >
                                                        <Map size={18} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20 px-10"
                        >
                            <Calendar size={48} className="mx-auto text-slate-200 mb-4" strokeWidth={1} />
                            <p className="text-slate-500 font-cinzel">No hay eventos programados</p>
                            <p className="text-slate-400 text-sm mt-2">Selecciona otra fecha para explorar la aventura.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* FAB: Add Personal Event */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-24 right-6 w-14 h-14 bg-slate-900 text-white rounded-2xl shadow-2xl shadow-slate-300 flex items-center justify-center z-40 border border-white/20"
            >
                <Plus size={28} />
            </motion.button>

            <AddEventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialDate={selectedDate}
            />
        </main>
    );
}
