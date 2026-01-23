import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Home, MessageSquare, Image, LogOut, FolderOpen, Calendar } from 'lucide-react';

export default async function AdminLayout({
    children,
    params
}: {
    children: ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    // Server-side verification
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

    // Double-check admin status
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    if (!user || !adminEmails.includes(user.email || '')) {
        redirect(`/${lang}`);
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Admin Header */}
            <header className="bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-fredoka font-bold">Admin Panel</h1>
                            <p className="text-sm opacity-90">{user.email}</p>
                        </div>
                        <form action="/auth/signout" method="post">
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                            >
                                <LogOut size={18} />
                                <span>Salir</span>
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <nav className="bg-white border-b border-slate-200 overflow-x-auto">
                <div className="container mx-auto px-4">
                    <div className="flex gap-1 min-w-max">
                        <Link
                            href={`/${lang}/admin`}
                            className="px-6 py-4 font-semibold text-slate-700 hover:text-orange-600 hover:bg-orange-50 transition-colors flex items-center gap-2 whitespace-nowrap"
                        >
                            <Home size={18} />
                            Dashboard
                        </Link>
                        <Link
                            href={`/${lang}/admin/wishes`}
                            className="px-6 py-4 font-semibold text-slate-700 hover:text-orange-600 hover:bg-orange-50 transition-colors flex items-center gap-2 whitespace-nowrap"
                        >
                            <MessageSquare size={18} />
                            Deseos
                        </Link>
                        <Link
                            href={`/${lang}/admin/photos`}
                            className="px-6 py-4 font-semibold text-slate-700 hover:text-orange-600 hover:bg-orange-50 transition-colors flex items-center gap-2 whitespace-nowrap"
                        >
                            <Image size={18} />
                            Fotos
                        </Link>
                        <Link
                            href={`/${lang}/admin/folders`}
                            className="px-6 py-4 font-semibold text-slate-700 hover:text-orange-600 hover:bg-orange-50 transition-colors flex items-center gap-2 whitespace-nowrap"
                        >
                            <FolderOpen size={18} />
                            Carpetas
                        </Link>
                        <Link
                            href={`/${lang}/admin/timeline`}
                            className="px-6 py-4 font-semibold text-slate-700 hover:text-orange-600 hover:bg-orange-50 transition-colors flex items-center gap-2 whitespace-nowrap"
                        >
                            <Calendar size={18} />
                            Timeline
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    );
}
