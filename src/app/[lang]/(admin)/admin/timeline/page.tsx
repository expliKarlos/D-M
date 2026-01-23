'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Loader2 } from 'lucide-react';
import TimelineEventForm from '@/components/admin/TimelineEventForm';
import TimelineEventTable from '@/components/admin/TimelineEventTable';
import { useTimeline } from '@/lib/contexts/TimelineContext';
import { deleteEvent, duplicateEvent, reorderEvents } from '@/lib/actions/timeline-actions';
import type { TimelineEvent } from '@/types/timeline';

export default function AdminTimelinePage() {
    const { events, isLoading, error } = useTimeline();
    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState<TimelineEvent | undefined>(undefined);
    const [countryFilter, setCountryFilter] = useState<'all' | 'Valladolid' | 'India'>('all');
    const [isDeleting, setIsDeleting] = useState(false);

    // Filter events by country
    const filteredEvents = useMemo(() => {
        if (countryFilter === 'all') return events;
        return events.filter(e => e.country === countryFilter);
    }, [events, countryFilter]);

    const handleEdit = (event: TimelineEvent) => {
        setEditingEvent(event);
        setShowForm(true);
    };

    const handleDelete = async (eventId: string) => {
        setIsDeleting(true);
        const result = await deleteEvent(eventId);
        setIsDeleting(false);

        if (!result.success) {
            alert(result.error || 'Error al eliminar el evento');
        }
    };

    const handleDuplicate = async (eventId: string) => {
        const result = await duplicateEvent(eventId);

        if (!result.success) {
            alert(result.error || 'Error al duplicar el evento');
        }
    };

    const handleReorder = async (eventIds: string[]) => {
        const result = await reorderEvents(eventIds);

        if (!result.success) {
            alert(result.error || 'Error al reordenar eventos');
        }
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingEvent(undefined);
    };

    const handleFormSuccess = () => {
        // Form will close automatically
        // Events will update via real-time listener
    };

    const valladolidCount = events.filter(e => e.country === 'Valladolid').length;
    const indiaCount = events.filter(e => e.country === 'India').length;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-24">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
                                <Calendar className="text-white" size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800">Gestión de Timeline</h1>
                                <p className="text-sm text-slate-600">
                                    {events.length} evento{events.length !== 1 ? 's' : ''} total{events.length !== 1 ? 'es' : ''}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                        >
                            <Plus size={20} />
                            Nuevo Evento
                        </button>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCountryFilter('all')}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${countryFilter === 'all'
                                    ? 'bg-slate-800 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            Todos ({events.length})
                        </button>
                        <button
                            onClick={() => setCountryFilter('Valladolid')}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${countryFilter === 'Valladolid'
                                    ? 'bg-red-500 text-white'
                                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                                }`}
                        >
                            🇪🇸 Valladolid ({valladolidCount})
                        </button>
                        <button
                            onClick={() => setCountryFilter('India')}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${countryFilter === 'India'
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                                }`}
                        >
                            🇮🇳 India ({indiaCount})
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 size={32} className="animate-spin text-orange-500" />
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                ) : (
                    <>
                        {/* Info Banner */}
                        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
                            <p className="text-sm">
                                💡 <strong>Tip:</strong> Arrastra los eventos para reordenarlos. Los cambios se guardan automáticamente.
                            </p>
                        </div>

                        {/* Events Table */}
                        <TimelineEventTable
                            events={filteredEvents}
                            onReorder={handleReorder}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onDuplicate={handleDuplicate}
                        />
                    </>
                )}
            </div>

            {/* Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <TimelineEventForm
                        event={editingEvent}
                        onClose={handleFormClose}
                        onSuccess={handleFormSuccess}
                    />
                )}
            </AnimatePresence>

            {/* Deleting Overlay */}
            {isDeleting && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg px-6 py-4 flex items-center gap-3">
                        <Loader2 size={24} className="animate-spin text-orange-500" />
                        <span className="font-semibold">Eliminando evento...</span>
                    </div>
                </div>
            )}
        </div>
    );
}
