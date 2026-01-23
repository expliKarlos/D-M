'use client';

import React from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit, Trash2, Copy } from 'lucide-react';
import Image from 'next/image';
import type { TimelineEvent } from '@/types/timeline';

interface TimelineEventTableProps {
    events: TimelineEvent[];
    onReorder: (eventIds: string[]) => void;
    onEdit: (event: TimelineEvent) => void;
    onDelete: (eventId: string) => void;
    onDuplicate: (eventId: string) => void;
}

function SortableRow({ event, onEdit, onDelete, onDuplicate }: {
    event: TimelineEvent;
    onEdit: (event: TimelineEvent) => void;
    onDelete: (eventId: string) => void;
    onDuplicate: (eventId: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: event.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const countryColor = event.country === 'Valladolid'
        ? 'bg-red-50 text-red-700 border-red-200'
        : 'bg-orange-50 text-orange-700 border-orange-200';

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
            <div className="flex items-center gap-4">
                {/* Drag Handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <GripVertical size={20} className="text-slate-400" />
                </button>

                {/* Image */}
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                    <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        className="object-cover"
                    />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${countryColor}`}>
                            {event.country === 'Valladolid' ? '🇪🇸' : '🇮🇳'} {event.country}
                        </span>
                        <span className="text-xs text-slate-500">{event.date} • {event.time}</span>
                    </div>
                    <h3 className="font-bold text-slate-800 truncate">{event.title}</h3>
                    <p className="text-sm text-slate-600 truncate">{event.location}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onDuplicate(event.id)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-slate-800"
                        title="Duplicar"
                    >
                        <Copy size={18} />
                    </button>
                    <button
                        onClick={() => onEdit(event)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600 hover:text-blue-700"
                        title="Editar"
                    >
                        <Edit size={18} />
                    </button>
                    <button
                        onClick={() => {
                            if (confirm('¿Estás seguro de eliminar este evento?')) {
                                onDelete(event.id);
                            }
                        }}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600 hover:text-red-700"
                        title="Eliminar"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function TimelineEventTable({
    events,
    onReorder,
    onEdit,
    onDelete,
    onDuplicate
}: TimelineEventTableProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = events.findIndex(e => e.id === active.id);
            const newIndex = events.findIndex(e => e.id === over.id);

            const newOrder = arrayMove(events, oldIndex, newIndex);
            onReorder(newOrder.map(e => e.id));
        }
    };

    if (events.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                <p className="text-slate-500 text-lg">No hay eventos todavía</p>
                <p className="text-slate-400 text-sm mt-2">Crea tu primer evento para comenzar</p>
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={events.map(e => e.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-3">
                    {events.map((event) => (
                        <SortableRow
                            key={event.id}
                            event={event}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onDuplicate={onDuplicate}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
