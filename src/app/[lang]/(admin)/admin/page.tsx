import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAdminStats } from '@/lib/actions/admin-actions';
import { MessageSquare, Image, TrendingUp } from 'lucide-react';

export default async function AdminDashboard({
    params
}: {
    params: { lang: string };
}) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set() { },
                remove() { },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    const statsResult = await getAdminStats(user?.email || '');

    if (!statsResult.success) {
        return <div>Error loading stats</div>;
    }

    const { wishCount, photoCount, recentWishes } = statsResult.stats!;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-fredoka font-bold text-slate-900 mb-2">
                    Dashboard
                </h2>
                <p className="text-slate-600">Resumen general de la aplicación</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Wishes Count */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                                Deseos Publicados
                            </p>
                            <p className="text-4xl font-bold text-slate-900 mt-2">
                                {wishCount}
                            </p>
                        </div>
                        <div className="p-3 bg-pink-100 rounded-xl">
                            <MessageSquare className="text-pink-600" size={28} />
                        </div>
                    </div>
                </div>

                {/* Photos Count */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                                Fotos en Galería
                            </p>
                            <p className="text-4xl font-bold text-slate-900 mt-2">
                                {photoCount}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <Image className="text-blue-600" size={28} />
                        </div>
                    </div>
                </div>

                {/* Activity */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                                Contenido Total
                            </p>
                            <p className="text-4xl font-bold text-slate-900 mt-2">
                                {wishCount + photoCount}
                            </p>
                        </div>
                        <div className="p-3 bg-orange-100 rounded-xl">
                            <TrendingUp className="text-orange-600" size={28} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Wishes */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                    Deseos Recientes
                </h3>
                {recentWishes && recentWishes.length > 0 ? (
                    <div className="space-y-3">
                        {recentWishes.map((wish: any) => (
                            <div
                                key={wish.id}
                                className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white font-bold">
                                    {wish.authorName?.[0]?.toUpperCase() || '?'}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-slate-900 text-sm">
                                        {wish.authorName || 'Anónimo'}
                                    </p>
                                    <p className="text-slate-600 text-sm line-clamp-2">
                                        {wish.text}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {new Date(wish.timestamp).toLocaleDateString('es-ES')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-500 text-center py-8">
                        No hay deseos todavía
                    </p>
                )}
            </div>
        </div>
    );
}
