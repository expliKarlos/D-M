'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, AlignLeft, Loader2 } from 'lucide-react';
import { db, auth } from '@/lib/services/firebase';
import { collection, addDoc, Timestamp, serverTimestamp } from 'firebase/firestore';

interface AddEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialDate: string | null;
}

export default function AddEventModal({ isOpen, onClose, initialDate }: AddEventModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        time: '',
        location: '',
        description: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user || !initialDate) return;

        setIsLoading(true);
        try {
            // Combinar fecha y hora para crear el objeto Date completo
            const [year, month, day] = initialDate.split('-').map(Number);
            const [hours, minutes] = (formData.time || '12:00').split(':').map(Number);
            const fullDate = new Date(year, month - 1, day, hours, minutes);

            await addDoc(collection(db, 'users', user.uid, 'user_itinerary'), {
                title: formData.title,
                time: formData.time,
                location: formData.location,
                description: formData.description,
                fullDate: Timestamp.fromDate(fullDate),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                category: 'Personal'
            });

            setFormData({ title: '', time: '', location: '', description: '' });
            onClose();
        } catch (error) {
            console.error('Error adding personal event:', error);
            alert('Error al guardar el evento. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#fafafa]">
                            <div>
                                <h2 className="text-xl font-cinzel font-bold text-slate-900">Añadir mi Plan</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    Para el {new Date(initialDate! + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                                </p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">¿Qué tienes planeado?</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                                        <Calendar size={18} />
                                    </div>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Ej: Llegada al hotel, Cena familiar..."
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Hora</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                                            <Clock size={18} />
                                        </div>
                                        <input
                                            required
                                            type="time"
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                            value={formData.time}
                                            onChange={e => setFormData({ ...formData, time: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Lugar</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                                            <MapPin size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="¿Dónde?"
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                            value={formData.location}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Notas (opcional)</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-4 text-slate-300">
                                        <AlignLeft size={18} />
                                    </div>
                                    <textarea
                                        rows={3}
                                        placeholder="Detalles adicionales..."
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg shadow-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Guardar en mi Agenda'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
