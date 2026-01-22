'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { deletePhoto } from '@/lib/actions/admin-actions';
import { Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Photo {
    name: string;
    created_at: string;
}

export default function AdminPhotosPage() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingPath, setDeletingPath] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState('');
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        loadPhotos();
        getUserEmail();
    }, []);

    const getUserEmail = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUserEmail(user?.email || '');
    };

    const loadPhotos = async () => {
        setLoading(true);
        const { data, error } = await supabase.storage
            .from('photos')
            .list('participation-gallery', {
                limit: 100,
                offset: 0,
                sortBy: { column: 'created_at', order: 'desc' }
            });

        if (error) {
            console.error('Error loading photos:', error);
        } else {
            setPhotos(data || []);
        }
        setLoading(false);
    };

    const getPhotoUrl = (fileName: string) => {
        return supabase.storage
            .from('photos')
            .getPublicUrl(`participation-gallery/${fileName}`)
            .data.publicUrl;
    };

    const handleDelete = async (fileName: string) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar esta foto?')) {
            return;
        }

        const filePath = `participation-gallery/${fileName}`;
        setDeletingPath(filePath);

        const result = await deletePhoto(filePath, userEmail);

        if (result.success) {
            // Refresh photos list
            await loadPhotos();
        } else {
            alert(`Error: ${result.error}`);
        }

        setDeletingPath(null);
        router.refresh();
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
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-fredoka font-bold text-slate-900">
                        Gestión de Fotos
                    </h2>
                    <p className="text-slate-600 mt-1">
                        {photos.length} {photos.length === 1 ? 'foto' : 'fotos'} en la galería
                    </p>
                </div>
            </div>

            {photos.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                    <ImageIcon className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-slate-500">No hay fotos en la galería todavía</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map((photo) => (
                        <div
                            key={photo.name}
                            className="group relative bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
                        >
                            {/* Photo */}
                            <div className="relative aspect-square">
                                <Image
                                    src={getPhotoUrl(photo.name)}
                                    alt={photo.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                />
                            </div>

                            {/* Info Overlay */}
                            <div className="p-3 bg-slate-50">
                                <p className="text-xs text-slate-600 truncate mb-2">
                                    {photo.name}
                                </p>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-slate-400">
                                        {new Date(photo.created_at).toLocaleDateString('es-ES')}
                                    </p>
                                    <button
                                        onClick={() => handleDelete(photo.name)}
                                        disabled={deletingPath === `participation-gallery/${photo.name}`}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                        {deletingPath === `participation-gallery/${photo.name}` ? (
                                            <Loader2 className="animate-spin" size={16} />
                                        ) : (
                                            <Trash2 size={16} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
