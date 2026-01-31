'use client';

import React from 'react';
import { X, User, Mail, Phone, MapPin, Utensils, MessageCircle, Calendar, CheckSquare } from 'lucide-react';

interface Guest {
    id: string;
    name: string;
    attending: boolean | null;
    dietary_restrictions: string | null;
    comments: string | null;
    country_code: string | null;
    phone: string | null;
    created_at: string;
    origin: string;
    avatar_url: string | null;
}

interface GuestDetailModalProps {
    guest: Guest | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function GuestDetailModal({ guest, isOpen, onClose }: GuestDetailModalProps) {
    if (!guest || !isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-end md:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="w-full md:w-[480px] h-full md:h-fit md:max-h-[90vh] bg-white md:rounded-[2.5rem] shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-50">
                    <h3 className="font-cinzel text-xl text-slate-800 tracking-tight">Detalles del Invitado</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 overflow-y-auto space-y-8">
                    {/* Profile Section */}
                    <div className="flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-3xl bg-rose-50 border-2 border-rose-100 flex items-center justify-center overflow-hidden mb-4 shadow-sm">
                            {guest.avatar_url ? (
                                <img src={guest.avatar_url} alt={guest.name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="text-rose-300" size={40} />
                            )}
                        </div>
                        <h4 className="text-xl font-bold text-slate-900">{guest.name}</h4>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm font-medium px-3 py-1 bg-slate-100 text-slate-600 rounded-lg flex items-center gap-1.5">
                                <MapPin size={14} /> {guest.origin === 'es' ? 'España' : 'India'}
                            </span>
                            <span className={`text-sm font-medium px-3 py-1 rounded-lg ${guest.attending === true ? 'bg-green-50 text-green-700' :
                                    guest.attending === false ? 'bg-red-50 text-red-700' :
                                        'bg-slate-50 text-slate-500'
                                }`}>
                                {guest.attending === true ? 'Asistirá' : guest.attending === false ? 'No asistirá' : 'Pendiente'}
                            </span>
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-4">
                            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Contacto</h5>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Phone size={18} className="text-slate-400" />
                                    <span className="text-sm">{guest.country_code} {guest.phone || 'No disponible'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Calendar size={18} className="text-slate-400" />
                                    <span className="text-sm">Registrado: {new Date(guest.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Preferencias y Mensajes</h5>
                            <div className="space-y-4">
                                <div className="flex gap-3 p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                                    <Utensils size={18} className="text-amber-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-amber-700 uppercase mb-1">Dietas / Alergias</p>
                                        <p className="text-sm text-slate-700 leading-relaxed font-outfit">
                                            {guest.dietary_restrictions || 'Ninguna especificada'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <MessageCircle size={18} className="text-slate-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Mensaje para la pareja</p>
                                        <p className="text-sm text-slate-700 leading-relaxed italic font-outfit">
                                            "{guest.comments || 'Sin comentarios'}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Travel Progress Placeholder */}
                        <div className="space-y-4">
                            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Tareas de Viaje</h5>
                            <div className="p-4 bg-rose-50/30 rounded-2xl border border-rose-100">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-semibold text-rose-700">Progreso General</span>
                                    <span className="text-xs font-bold text-rose-700 font-outfit">60%</span>
                                </div>
                                <div className="w-full h-2 bg-rose-100 rounded-full overflow-hidden mb-4">
                                    <div className="h-full bg-rose-400 rounded-full" style={{ width: '60%' }}></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                        <CheckSquare size={14} className="text-green-500" /> Vuelos subidos
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                        <CheckSquare size={14} className="text-green-500" /> Pasaporte validado
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <div className="w-3.5 h-3.5 border border-slate-300 rounded" /> Visado pendiente
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 mt-auto">
                    <button
                        onClick={onClose}
                        className="w-full bg-white border border-slate-200 text-slate-700 font-bold py-3 rounded-2xl hover:bg-slate-100 transition-all text-sm uppercase tracking-wider"
                    >
                        Cerrar panel
                    </button>
                </div>
            </div>

            {/* Click outside to close (desktop) */}
            <div className="hidden md:block absolute inset-0 -z-10" onClick={onClose}></div>
        </div>
    );
}
