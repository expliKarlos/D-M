'use client';

import React, { useState } from 'react';
import { Search, Filter, User, MapPin, CheckCircle2, XCircle, Clock, MoreVertical, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

interface GuestTableProps {
    guests: Guest[];
    onViewDetail: (guest: Guest) => void;
}

export default function GuestTable({ guests, onViewDetail }: GuestTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterOrigin, setFilterOrigin] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const filteredGuests = guests.filter(guest => {
        const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            guest.phone?.includes(searchTerm);
        const matchesOrigin = filterOrigin === 'all' || guest.origin === filterOrigin;
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'yes' && guest.attending === true) ||
            (filterStatus === 'no' && guest.attending === false) ||
            (filterStatus === 'pending' && guest.attending === null);

        return matchesSearch && matchesOrigin && matchesStatus;
    });

    const getStatusBadge = (attending: boolean | null) => {
        if (attending === true) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                    <CheckCircle2 size={12} /> Confirmado
                </span>
            );
        }
        if (attending === false) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                    <XCircle size={12} /> Declinado
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-600 border border-slate-100">
                <Clock size={12} /> Pendiente
            </span>
        );
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o teléfono..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300 transition-all font-outfit text-sm"
                    />
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                        <MapPin size={16} className="text-slate-500" />
                        <select
                            value={filterOrigin}
                            onChange={(e) => setFilterOrigin(e.target.value)}
                            className="bg-transparent text-sm font-medium text-slate-700 outline-none"
                        >
                            <option value="all">Todos los orígenes</option>
                            <option value="es">España</option>
                            <option value="hi">India</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                        <Filter size={16} className="text-slate-500" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-transparent text-sm font-medium text-slate-700 outline-none"
                        >
                            <option value="all">Todos los estados</option>
                            <option value="yes">Confirmados</option>
                            <option value="no">Declinados</option>
                            <option value="pending">Pendientes</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Invitado</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Origen</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">RSVP</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Fecha Registro</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredGuests.length > 0 ? (
                                filteredGuests.map((guest) => (
                                    <tr key={guest.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center overflow-hidden">
                                                    {guest.avatar_url ? (
                                                        <img src={guest.avatar_url} alt={guest.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="text-rose-300" size={20} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800 text-sm">{guest.name}</p>
                                                    <p className="text-xs text-slate-500">{guest.phone || 'Sin teléfono'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-2xl" title={guest.origin === 'es' ? 'España' : 'India'}>
                                                {guest.origin === 'es' ? '🇪🇸' : '🇮🇳'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getStatusBadge(guest.attending)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-slate-600">
                                                {format(new Date(guest.created_at), "d MMM, yyyy", { locale: es })}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => onViewDetail(guest)}
                                                className="p-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-all"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic font-light">
                                        No se encontraron invitados que coincidan con la búsqueda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
