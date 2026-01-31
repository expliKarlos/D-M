'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCcw, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import GuestTable from '@/components/admin/GuestTable';
import GuestDetailModal from '@/components/admin/GuestDetailModal';
import { getAllGuests, getGuestStats } from '@/lib/actions/admin-guests';

interface GuestsDashboardProps {
    adminEmail: string;
    initialGuests: any[];
    initialStats: any;
}

export default function GuestsDashboard({ adminEmail, initialGuests, initialStats }: GuestsDashboardProps) {
    const [guests, setGuests] = useState(initialGuests);
    const [stats, setStats] = useState(initialStats);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedGuest, setSelectedGuest] = useState<any | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const refreshData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [guestsRes, statsRes] = await Promise.all([
                getAllGuests(adminEmail),
                getGuestStats(adminEmail)
            ]);

            if (guestsRes.success && guestsRes.guests) {
                setGuests(guestsRes.guests);
            }
            if (statsRes.success && statsRes.stats) {
                setStats(statsRes.stats);
            }
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [adminEmail]);

    const handleViewDetail = (guest: any) => {
        setSelectedGuest(guest);
        setIsDetailOpen(true);
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="font-cinzel text-3xl text-slate-900 mb-1">Gestión de Invitados</h1>
                    <p className="text-slate-500 text-sm">Monitoriza confirmaciones, alergias e información de viaje.</p>
                </div>
                <button
                    onClick={refreshData}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
                >
                    <RefreshCcw size={16} className={isLoading ? 'animate-spin' : ''} />
                    {isLoading ? 'Actualizando...' : 'Refrescar Datos'}
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard
                    label="Total Registrados"
                    value={stats.total}
                    icon={<Users className="text-blue-500" size={24} />}
                    color="blue"
                />
                <StatCard
                    label="Confirmados (SÍ)"
                    value={stats.confirmed}
                    icon={<CheckCircle className="text-green-500" size={24} />}
                    color="green"
                />
                <StatCard
                    label="Declinados (NO)"
                    value={stats.declined}
                    icon={<XCircle className="text-red-500" size={24} />}
                    color="red"
                />
                <StatCard
                    label="Pendientes"
                    value={stats.total - (stats.confirmed + stats.declined)}
                    icon={<Clock className="text-amber-500" size={24} />}
                    color="amber"
                />
            </div>

            {/* Main Table */}
            <GuestTable
                guests={guests}
                onViewDetail={handleViewDetail}
            />

            {/* Detail Modal */}
            <GuestDetailModal
                guest={selectedGuest}
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
            />
        </div>
    );
}

function StatCard({ label, value, icon, color }: { label: string, value: number, icon: React.ReactNode, color: string }) {
    const bgColors: Record<string, string> = {
        blue: 'bg-blue-50 border-blue-100',
        green: 'bg-green-50 border-green-100',
        red: 'bg-red-50 border-red-100',
        amber: 'bg-amber-50 border-amber-100'
    };

    return (
        <div className={`p-6 rounded-[2rem] border ${bgColors[color]} shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm">
                    {icon}
                </div>
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-3xl font-bold text-slate-800 font-cinzel">{value}</p>
            </div>
        </div>
    );
}
