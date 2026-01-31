import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/utils/supabase/server';
import { getAllGuests, getGuestStats } from '@/lib/actions/admin-guests';
import GuestsDashboard from '@/components/admin/GuestsDashboard';

interface PageProps {
    params: { locale: string };
}

export default async function AdminGuestsPage({ params }: PageProps) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/${params.locale}/login`);
    }

    // Double check admin role
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    if (!adminEmails.includes(user.email || '')) {
        redirect(`/${params.locale}`);
    }

    // Fetch initial data
    const [guestsRes, statsRes] = await Promise.all([
        getAllGuests(user.email!),
        getGuestStats(user.email!)
    ]);

    if (!guestsRes.success || !statsRes.success) {
        // Handle error state
        return (
            <div className="p-8 text-center bg-red-50 rounded-3xl border border-red-100 text-red-700">
                Hubo un error al cargar la información de invitados. Por favor, intenta de nuevo.
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <Suspense fallback={<div className="animate-pulse space-y-8">
                <div className="h-20 bg-slate-100 rounded-2xl w-full" />
                <div className="grid grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-[2rem]" />)}
                </div>
                <div className="h-96 bg-slate-100 rounded-3xl w-full" />
            </div>}>
                <GuestsDashboard
                    adminEmail={user.email!}
                    initialGuests={guestsRes.guests || []}
                    initialStats={statsRes.stats}
                />
            </Suspense>
        </div>
    );
}
