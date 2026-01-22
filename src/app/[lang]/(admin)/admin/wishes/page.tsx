'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/services/firebase';
import { deleteWish } from '@/lib/actions/admin-actions';
import { Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Wish {
    id: string;
    text: string;
    imageUrl?: string;
    authorName: string;
    timestamp: number;
    likesCount: number;
}

export default function AdminWishesPage() {
    const [wishes, setWishes] = useState<Wish[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState('');
    const router = useRouter();

    // Get user email from Supabase
    useEffect(() => {
        const getUserEmail = async () => {
            const { createBrowserClient } = await import('@supabase/ssr');
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );
            const { data: { user } } = await supabase.auth.getUser();
            setUserEmail(user?.email || '');
        };
        getUserEmail();
    }, []);

    // Real-time Firestore listener
    useEffect(() => {
        const q = query(collection(db, 'wishes'), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const wishesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Wish));
            setWishes(wishesData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (wishId: string) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este deseo?')) {
            return;
        }

        setDeletingId(wishId);
        const result = await deleteWish(wishId, userEmail);

        if (!result.success) {
            alert(`Error: ${result.error}`);
        }

        setDeletingId(null);
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
                        Gestión de Deseos
                    </h2>
                    <p className="text-slate-600 mt-1">
                        {wishes.length} {wishes.length === 1 ? 'deseo' : 'deseos'} publicados
                    </p>
                </div>
            </div>

            {wishes.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                    <ImageIcon className="mx-auto text-slate-300 mb-4" size={48} />
                    <p className="text-slate-500">No hay deseos publicados todavía</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishes.map((wish) => (
                        <div
                            key={wish.id}
                            className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 hover:shadow-md transition-shadow"
                        >
                            {/* Image if exists */}
                            {wish.imageUrl && (
                                <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-3">
                                    <Image
                                        src={wish.imageUrl}
                                        alt="Wish image"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}

                            {/* Text */}
                            <p className="text-slate-700 mb-3 line-clamp-3">
                                &quot;{wish.text}&quot;
                            </p>

                            {/* Metadata */}
                            <div className="flex items-center justify-between text-sm">
                                <div>
                                    <p className="font-semibold text-slate-900">
                                        {wish.authorName || 'Anónimo'}
                                    </p>
                                    <p className="text-slate-500 text-xs">
                                        {new Date(wish.timestamp).toLocaleString('es-ES')}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDelete(wish.id)}
                                    disabled={deletingId === wish.id}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {deletingId === wish.id ? (
                                        <Loader2 className="animate-spin" size={18} />
                                    ) : (
                                        <Trash2 size={18} />
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
