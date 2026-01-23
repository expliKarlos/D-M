'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, MapPin, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { createEvent, updateEvent } from '@/lib/actions/timeline-actions';
import type { TimelineEvent } from '@/types/timeline';

interface TimelineEventFormProps {
    event?: TimelineEvent;
    onClose: () => void;
    onSuccess: () => void;
}

export default function TimelineEventForm({ event, onClose, onSuccess }: TimelineEventFormProps) {
    const isEditing = !!event;

    const [formData, setFormData] = useState({
        country: event?.country || 'Valladolid' as 'Valladolid' | 'India',
        title: event?.title || '',
        date: event?.date || '',
        time: event?.time || '',
        description: event?.description || '',
        location: event?.location || '',
        lat: event?.coordinates.lat.toString() || '',
        lng: event?.coordinates.lng.toString() || '',
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>(event?.image || '');
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSaving(true);

        try {
            let imageUrl = imagePreview;

            // Upload new image if selected
            if (imageFile) {
                setIsUploading(true);
                try {
                    const uploadFormData = new FormData();
                    uploadFormData.append('file', imageFile);

                    const uploadResponse = await fetch('/api/upload-timeline-image', {
                        method: 'POST',
                        body: uploadFormData
                    });

                    if (!uploadResponse.ok) {
                        const errorData = await uploadResponse.json();
                        throw new Error(errorData.error || 'Error al subir la imagen');
                    }

                    const { url } = await uploadResponse.json();
                    imageUrl = url;
                } finally {
                    setIsUploading(false);
                }
            }

            // Validate required fields
            if (!formData.title || !formData.date || !formData.time || !formData.description || !formData.location || !imageUrl) {
                setError('Todos los campos son obligatorios');
                setIsSaving(false);
                return;
            }

            // Create FormData for server action
            const submitFormData = new FormData();
            submitFormData.append('country', formData.country);
            submitFormData.append('title', formData.title);
            submitFormData.append('date', formData.date);
            submitFormData.append('time', formData.time);
            submitFormData.append('description', formData.description);
            submitFormData.append('location', formData.location);
            submitFormData.append('lat', formData.lat);
            submitFormData.append('lng', formData.lng);
            submitFormData.append('imageUrl', imageUrl);

            if (!isEditing) {
                submitFormData.append('order', '0'); // Will be adjusted by reordering
            }

            const result = isEditing
                ? await updateEvent(event.id, submitFormData)
                : await createEvent(submitFormData);

            if (!result.success) {
                setError(result.error || 'Error al guardar el evento');
                setIsSaving(false);
                return;
            }

            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error submitting form:', err);
            setError(err instanceof Error ? err.message : 'Error al guardar el evento');
            setIsSaving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <h2 className="text-2xl font-bold text-slate-800">
                        {isEditing ? 'Editar Evento' : 'Nuevo Evento'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Country */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            País
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, country: 'Valladolid' })}
                                className={`px-4 py-3 rounded-lg border-2 font-semibold transition-all ${formData.country === 'Valladolid'
                                        ? 'border-red-500 bg-red-50 text-red-700'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                    }`}
                            >
                                🇪🇸 Valladolid
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, country: 'India' })}
                                className={`px-4 py-3 rounded-lg border-2 font-semibold transition-all ${formData.country === 'India'
                                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                    }`}
                            >
                                🇮🇳 India
                            </button>
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Título del Evento
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Ej: Ceremonia"
                            required
                        />
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Fecha
                            </label>
                            <input
                                type="text"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="12 de Junio, 2026"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Hora
                            </label>
                            <input
                                type="text"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="18:00"
                                required
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Descripción
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                            rows={3}
                            placeholder="Descripción del evento..."
                            required
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Ubicación
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="Nombre del lugar"
                                required
                            />
                        </div>
                    </div>

                    {/* Coordinates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Latitud
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={formData.lat}
                                onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="41.6176"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Longitud
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={formData.lng}
                                onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="-4.7492"
                                required
                            />
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Imagen del Evento
                        </label>
                        <div className="space-y-3">
                            {imagePreview && (
                                <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-slate-200">
                                    <Image
                                        src={imagePreview}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors cursor-pointer">
                                <Upload size={20} />
                                <span className="font-semibold">
                                    {imagePreview ? 'Cambiar Imagen' : 'Subir Imagen'}
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                            disabled={isSaving}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || isUploading}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {(isSaving || isUploading) && <Loader2 size={20} className="animate-spin" />}
                            {isUploading ? 'Subiendo imagen...' : isSaving ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Evento'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}
