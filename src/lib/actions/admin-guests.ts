'use server';

import { createAdminClient } from '@/lib/utils/supabase/admin';
import { revalidatePath } from 'next/cache';

const supabase = createAdminClient();

export async function isUserAdmin(email: string): Promise<boolean> {
    const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    return adminEmails.includes(email);
}

export async function getAllGuests(adminEmail: string) {
    try {
        if (!await isUserAdmin(adminEmail)) {
            return { success: false, error: 'Unauthorized' };
        }

        // Fetch guests and profiles to get origin (lang)
        // Note: we'll join on name for simplicity since there might not be a direct link if they didn't sign in
        const { data: guests, error: guestsError } = await supabase
            .from('guests')
            .select('*')
            .order('created_at', { ascending: false });

        if (guestsError) throw guestsError;

        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('full_name, preferred_lang, avatar_url');

        if (profilesError) throw profilesError;

        // Merge data
        const mergedGuests = guests.map(guest => {
            const profile = profiles.find(p => p.full_name?.toLowerCase() === guest.name.toLowerCase());
            return {
                ...guest,
                origin: profile?.preferred_lang || 'es', // Default to es
                avatar_url: profile?.avatar_url || null
            };
        });

        return { success: true, guests: mergedGuests };
    } catch (error) {
        console.error('Error fetching guests:', error);
        return { success: false, error: 'Failed to fetch guests' };
    }
}

export async function getGuestStats(adminEmail: string) {
    try {
        if (!await isUserAdmin(adminEmail)) {
            return { success: false, error: 'Unauthorized' };
        }

        const { data: guests, error } = await supabase
            .from('guests')
            .select('attending');

        if (error) throw error;

        const stats = {
            total: guests.length,
            confirmed: guests.filter(g => g.attending === true).length,
            declined: guests.filter(g => g.attending === false).length,
            pending: 0 // In this simple model, registered but not confirmed?
        };

        return { success: true, stats };
    } catch (error) {
        console.error('Error fetching stats:', error);
        return { success: false, error: 'Failed to fetch stats' };
    }
}

export async function deleteGuest(id: string, adminEmail: string) {
    try {
        if (!await isUserAdmin(adminEmail)) {
            return { success: false, error: 'Unauthorized' };
        }

        const { error } = await supabase
            .from('guests')
            .delete()
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/admin/guests');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete guest' };
    }
}
