'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, MapPin, Loader2, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { createEvent, updateEvent } from '@/lib/actions/timeline-actions';
import type { TimelineEvent } from '@/types/timeline';
import { getUniversalTranslation } from '@/lib/actions/translation-actions';

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
        title_es: event?.title_es || '',
        title_en: event?.title_en || '',
        title_hi: event?.title_hi || '',
        date: event?.date || '',
        time: event?.time || '',
        description: event?.description || '',
        description_es: event?.description_es || '',
        description_en: event?.description_en || '',
        description_hi: event?.description_hi || '',
        location: event?.location || '',
        lat: event?.coordinates.lat.toString() || '',
        lng: event?.coordinates.lng.toString() || '',
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>(event?.image || '');
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isTranslatingTitle, setIsTranslatingTitle] = useState(false);
    const [isTranslatingDesc, setIsTranslatingDesc] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAutoTranslateTitle = async () => {
        if (!formData.title.trim()) return;
        setIsTranslatingTitle(true);
        const result = await getUniversalTranslation(formData.title);
        if (result.success && result.data) {
            setFormData(prev => ({
                ...prev,
                title_es: result.data!.es,
                title_en: result.data!.en,
                title_hi: result.data!.hi,
            }));
        } else {
            setError('Error en la traducción automática');
        }
        setIsTranslatingTitle(false);
    };

    const handleAutoTranslateDescription = async () => {
        if (!formData.description.trim()) return;
        setIsTranslatingDesc(true);
        const result = await getUniversalTranslation(formData.description);
        if (result.success && result.data) {
            setFormData(prev => ({
                ...prev,
                description_es: result.data!.es,
                description_en: result.data!.en,
                description_hi: result.data!.hi,
            }));
        } else {
            setError('Error en la traducción automática');
        }
        setIsTranslatingDesc(false);
    };

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
            if (!formData.title || !formData.description || !formData.location || !imageUrl) {
                setError('Título, descripción, ubicación e imagen son obligatorios');
                setIsSaving(false);
                return;
            }

            // Create FormData for server action
            const submitFormData = new FormData();
            submitFormData.append('country', formData.country);
            submitFormData.append('title', formData.title);
            submitFormData.append('title_es', formData.title_es);
            submitFormData.append('title_en', formData.title_en);
            submitFormData.append('title_hi', formData.title_hi);
            submitFormData.append('date', formData.date);
            submitFormData.append('time', formData.time);
            submitFormData.append('description', formData.description);
            submitFormData.append('description_es', formData.description_es);
            submitFormData.append('description_en', formData.description_en);
            submitFormData.append('description_hi', formData.description_hi);
            submitFormData.append('location', formData.location);
            submitFormData.append('lat', formData.lat);
            submitFormData.append('lng', formData.lng);
            submitFormData.append('imageUrl', imageUrl);

            if (!isEditing) {
                submitFormData.append('order', '0');
            }

            const result = isEditing
                ? await updateEvent(event!.id, submitFormData)
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
                <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
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

                    {/* Title Section */}
                    <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-semibold text-slate-700">
                                Título Principal
                            </label>
                            <button
                                type="button"
                                onClick={handleAutoTranslateTitle}
                                disabled={isTranslatingTitle || !formData.title.trim()}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-xs font-bold hover:shadow-md transition-all disabled:opacity-50"
                            >
                                {isTranslatingTitle ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                Auto-traducir Títulos
                            </button>
                        </div>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                            placeholder="Ej: Ceremonia"
                            required
                        />
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Español</label>
                                <input type="text" value={formData.title_es} onChange={(e) => setFormData({ ...formData, title_es: e.target.value })} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Inglés</label>
                                <input type="text" value={formData.title_en} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Hindi</label>
                                <input type="text" value={formData.title_hi} onChange={(e) => setFormData({ ...formData, title_hi: e.target.value })} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md" />
                            </div>
                        </div>
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

                    {/* Description Section */}
                    <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-semibold text-slate-700">
                                Descripción Principal
                            </label>
                            <button
                                type="button"
                                onClick={handleAutoTranslateDescription}
                                disabled={isTranslatingDesc || !formData.description.trim()}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-xs font-bold hover:shadow-md transition-all disabled:opacity-50"
                            >
                                {isTranslatingDesc ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                Auto-traducir Desc.
                            </button>
                        </div>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none bg-white"
                            rows={3}
                            placeholder="Descripción del evento..."
                            required
                        />
                        <div className="space-y-2 mt-2">
                            <div className="flex gap-2">
                                <div className="flex-1 space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">ES</label>
                                    <textarea value={formData.description_es} onChange={(e) => setFormData({ ...formData, description_es: e.target.value })} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md resize-none" rows={2} />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">EN</label>
                                    <textarea value={formData.description_en} onChange={(e) => setFormData({ ...formData, description_en: e.target.value })} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md resize-none" rows={2} />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">HI</label>
                                    <textarea value={formData.description_hi} onChange={(e) => setFormData({ ...formData, description_hi: e.target.value })} className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-md resize-none font-[Tiro_Devanagari_Hindi]" rows={2} />
                                </div>
                            </div>
                        </div>
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
                    <div className="flex gap-3 pt-4 sticky bottom-0 bg-white/80 backdrop-blur-sm pb-4">
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
