'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { getAdminPhotos, deletePhoto, bulkDeletePhotos, updatePhotoMoment } from '@/lib/actions/admin-actions';
import { getMoments, type Moment } from '@/lib/actions/admin-folders';
import { Trash2, Loader2, Image as ImageIcon, Filter, CheckSquare, Square, X, UploadCloud, ChevronDown, Check } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';

interface PhotoMetadata {
    id: string;
    url: string;
    content?: string;
    moment?: string;
    timestamp: number;
    author?: string;
}

export default function AdminPhotosPage() {
    const [allPhotos, setAllPhotos] = useState<PhotoMetadata[]>([]);
    const [moments, setMoments] = useState<Moment[]>([]);
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState('');
    const [selectedMoments, setSelectedMoments] = useState<string>('all');
    const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [isBulkUploading, setIsBulkUploading] = useState(false);

    const router = useRouter();
    const params = useParams();
    const lang = params?.lang as string;
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        const email = user?.email || '';
        setUserEmail(email);

        const [photosRes, momentsRes] = await Promise.all([
            getAdminPhotos(email),
            getMoments()
        ]);

        if (photosRes.success) setAllPhotos(photosRes.photos as any);
        setMoments(momentsRes);
        setLoading(false);
    };

    const filteredPhotos = allPhotos.filter(p =>
        selectedMoments === 'all' || p.moment === selectedMoments
    );

    const togglePhotoSelection = (id: string) => {
        const newSet = new Set(selectedPhotos);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedPhotos(newSet);
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`¿Estás seguro de que quieres eliminar ${selectedPhotos.size} fotos?`)) return;

        setIsBulkDeleting(true);
        const photoIds = Array.from(selectedPhotos);
        const photoPaths = photoIds.map(id => {
            const photo = allPhotos.find(p => p.id === id);
            const url = photo?.url || photo?.content || '';
            // Extract path from Supabase URL: .../photos/participation-gallery/filename.jpg
            const pathParts = url.split('/photos/')[1];
            return pathParts || '';
        }).filter(p => p !== '');

        const result = await bulkDeletePhotos(photoIds, photoPaths, userEmail);
        if (result.success) {
            setSelectedPhotos(new Set());
            loadData();
        } else {
            alert('Error al eliminar: ' + result.error);
        }
        setIsBulkDeleting(false);
    };

    const handleUpdateMoment = async (photoId: string, momentId: string) => {
        const result = await updatePhotoMoment(photoId, momentId, userEmail);
        if (result.success) {
            loadData();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-slate-400" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-fredoka font-bold text-slate-900">Gestión de Galería</h2>
                    <p className="text-slate-600 mt-1">{allPhotos.length} fotos registradas en total</p>
                </div>
                <div className="flex gap-2">
                    {selectedPhotos.size > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            disabled={isBulkDeleting}
                            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl font-semibold shadow-md hover:bg-red-600 transition-all disabled:opacity-50"
                        >
                            {isBulkDeleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                            Borrar {selectedPhotos.size}
                        </button>
                    )}
                    <button
                        onClick={() => router.push(`/${lang}/admin/photos/upload`)}
                        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-semibold shadow-md hover:bg-slate-800 transition-all"
                    >
                        <UploadCloud size={18} />
                        Subida Masiva
                    </button>
                </div>
            </div>

            {/* Filters & Controls */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-slate-500">
                    <Filter size={18} />
                    <span className="text-sm font-semibold uppercase tracking-wider">Filtrar por:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedMoments('all')}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                            selectedMoments === 'all' ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        )}
                    >
                        Todas
                    </button>
                    {moments.map(m => (
                        <button
                            key={m.id}
                            onClick={() => setSelectedMoments(m.id)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5",
                                selectedMoments === m.id ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            )}
                        >
                            <span>{m.icon}</span>
                            {m.name}
                        </button>
                    ))}
                </div>

                <div className="ml-auto">
                    <button
                        onClick={() => {
                            if (selectedPhotos.size === filteredPhotos.length) setSelectedPhotos(new Set());
                            else setSelectedPhotos(new Set(filteredPhotos.map(p => p.id)));
                        }}
                        className="text-sm text-blue-600 font-semibold hover:underline"
                    >
                        {selectedPhotos.size === filteredPhotos.length ? 'Deseleccionar todo' : 'Seleccionar todo el filtro'}
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredPhotos.map((photo) => {
                    const isSelected = selectedPhotos.has(photo.id);
                    return (
                        <div
                            key={photo.id}
                            onClick={() => togglePhotoSelection(photo.id)}
                            className={cn(
                                "group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all",
                                isSelected ? "border-orange-500 scale-[0.98] ring-4 ring-orange-500/10" : "border-transparent hover:border-slate-200"
                            )}
                        >
                            <Image
                                src={photo.url || photo.content || ''}
                                alt="Gallery item"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 50vw, 20vw"
                            />

                            {/* Selection Overlay */}
                            <div className={cn(
                                "absolute top-2 right-2 p-1.5 rounded-full transition-all",
                                isSelected ? "bg-orange-500 text-white" : "bg-black/20 text-white opacity-0 group-hover:opacity-100"
                            )}>
                                {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                            </div>

                            {/* Moment Tag / Selector */}
                            <div
                                className="absolute bottom-2 left-2 right-2 flex justify-center"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="relative group/menu">
                                    <button className="bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 border border-white/20 hover:bg-black/80">
                                        {moments.find(m => m.id === photo.moment)?.name || 'Sin Carpeta'}
                                        <ChevronDown size={10} />
                                    </button>

                                    {/* Quick Moment Change Menu */}
                                    <div className="absolute bottom-full left-0 mb-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 py-1 opacity-0 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:pointer-events-auto transition-all z-20 overflow-hidden">
                                        {moments.map(m => (
                                            <button
                                                key={m.id}
                                                onClick={() => handleUpdateMoment(photo.id, m.id)}
                                                className="w-full text-left px-3 py-1.5 text-[11px] hover:bg-slate-50 flex items-center justify-between"
                                            >
                                                <span className="flex items-center gap-2"><span>{m.icon}</span>{m.name}</span>
                                                {photo.moment === m.id && <Check size={10} className="text-green-500" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredPhotos.length === 0 && (
                <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-slate-100">
                    <ImageIcon className="mx-auto text-slate-100 mb-4" size={64} />
                    <p className="text-slate-400 font-fredoka text-lg">No se encontraron fotos en este filtro</p>
                </div>
            )}
        </div>
    );
}
