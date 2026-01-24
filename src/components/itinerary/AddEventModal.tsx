'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, MapPin, AlignLeft, Loader2, Plane, Hotel, Utensils, Camera, MoreHorizontal, ChevronLeft } from 'lucide-react';
import { db, auth } from '@/lib/services/firebase';
import { collection, addDoc, Timestamp, serverTimestamp } from 'firebase/firestore';

interface AddEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialDate: string | null;
}

type PlanType = 'vuelo' | 'hotel' | 'restaurante' | 'turismo' | 'otro';

export default function AddEventModal({ isOpen, onClose, initialDate }: AddEventModalProps) {
    const [step, setStep] = useState<'select' | 'form'>('select');
    const [planType, setPlanType] = useState<PlanType>('otro');
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        time: '',
        location: '',
        description: '',
        date: initialDate || ''
    });

    useEffect(() => {
        if (isOpen) {
            setStep('select');
            setFormData(prev => ({ ...prev, date: initialDate || '' }));
        }
    }, [isOpen, initialDate]);

    const handleTypeSelect = (type: PlanType) => {
        setPlanType(type);
        setStep('form');

        // Pre-fill titles based on type
        const defaultTitles: Record<PlanType, string> = {
            vuelo: 'Mi Vuelo',
            hotel: 'Check-in Hotel',
            restaurante: 'Reserva Restaurante',
            turismo: 'Visita Turística',
            otro: ''
        };
        setFormData(prev => ({ ...prev, title: defaultTitles[type] }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user || !formData.date) return;

        setIsLoading(true);
        try {
            const [year, month, day] = formData.date.split('-').map(Number);
            const [hours, minutes] = (formData.time || '12:00').split(':').map(Number);
            const fullDate = new Date(year, month - 1, day, hours, minutes);

            await addDoc(collection(db, 'users', user.uid, 'personal_itinerary'), {
                title: formData.title,
                time: formData.time,
                location: formData.location,
                description: formData.description,
                fullDate: Timestamp.fromDate(fullDate),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                category: planType.charAt(0).toUpperCase() + planType.slice(1),
                isOfficial: false
            });

            setFormData({ title: '', time: '', location: '', description: '', date: initialDate || '' });
            onClose();
        } catch (error) {
            console.error('Error adding personal event:', error);
            alert('Error al guardar el evento. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const planTypes = [
        { id: 'vuelo' as PlanType, label: 'Mi Vuelo', icon: Plane, color: 'bg-blue-50 text-blue-600' },
        { id: 'hotel' as PlanType, label: 'Mi Hotel', icon: Hotel, color: 'bg-indigo-50 text-indigo-600' },
        { id: 'restaurante' as PlanType, label: 'Restaurante', icon: Utensils, color: 'bg-orange-50 text-orange-600' },
        { id: 'turismo' as PlanType, label: 'Turismo', icon: Camera, color: 'bg-emerald-50 text-emerald-600' },
        { id: 'otro' as PlanType, label: 'Otro', icon: MoreHorizontal, color: 'bg-slate-50 text-slate-600' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="relative w-full max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
                            <div className="flex items-center gap-3">
                                {step === 'form' && (
                                    <button
                                        onClick={() => setStep('select')}
                                        className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                )}
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                                        {step === 'select' ? 'Crear Nuevo Plan' : 'Detalles del Plan'}
                                    </h2>
                                    <p className="text-[10px] font-black text-saffron uppercase tracking-[0.2em] mt-0.5">
                                        Itinerario Personal
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                <X size={20} className="text-slate-300" />
                            </button>
                        </div>

                        <div className="p-6 max-h-[80vh] overflow-y-auto hide-scrollbar">
                            <AnimatePresence mode="wait">
                                {step === 'select' ? (
                                    <motion.div
                                        key="select"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="grid grid-cols-2 gap-4"
                                    >
                                        {planTypes.map((type) => (
                                            <button
                                                key={type.id}
                                                onClick={() => handleTypeSelect(type.id)}
                                                className="flex flex-col items-center justify-center p-6 rounded-[2rem] border border-slate-100 hover:border-saffron/30 hover:shadow-xl hover:shadow-slate-100 transition-all group"
                                            >
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${type.color}`}>
                                                    <type.icon size={28} />
                                                </div>
                                                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                                                    {type.label}
                                                </span>
                                            </button>
                                        ))}
                                    </motion.div>
                                ) : (
                                    <motion.form
                                        key="form"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        onSubmit={handleSubmit}
                                        className="space-y-5"
                                    >
                                        {/* Date & Time */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha</label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                                    <input
                                                        required
                                                        type="date"
                                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-saffron/20 focus:border-saffron transition-all text-sm font-bold text-slate-700"
                                                        value={formData.date}
                                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hora</label>
                                                <div className="relative">
                                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                                    <input
                                                        required
                                                        type="time"
                                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-saffron/20 focus:border-saffron transition-all text-sm font-bold text-slate-700"
                                                        value={formData.time}
                                                        onChange={e => setFormData({ ...formData, time: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Dynamic Title / Flight Number */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                                {planType === 'vuelo' ? 'Número de Vuelo' : 'Título del Plan'}
                                            </label>
                                            <input
                                                required
                                                type="text"
                                                placeholder={planType === 'vuelo' ? 'Ej: EK142 o VY1234' : 'Ej: Cena en el centro...'}
                                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-saffron/20 focus:border-saffron transition-all text-sm font-bold text-slate-700"
                                                value={formData.title}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            />
                                        </div>

                                        {/* Location */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ubicación / Lugar</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                                <input
                                                    required={planType !== 'vuelo'}
                                                    type="text"
                                                    placeholder="¿Dónde será el evento?"
                                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-saffron/20 focus:border-saffron transition-all text-sm font-bold text-slate-700"
                                                    value={formData.location}
                                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notas Adicionales</label>
                                            <div className="relative">
                                                <AlignLeft className="absolute left-4 top-4 text-slate-300" size={16} />
                                                <textarea
                                                    rows={3}
                                                    placeholder="Cualquier detalle que quieras recordar..."
                                                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-saffron/20 focus:border-saffron transition-all text-sm font-medium text-slate-600 resize-none"
                                                    value={formData.description}
                                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isLoading}
                                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                                        >
                                            {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Guardar Plan'}
                                        </button>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
