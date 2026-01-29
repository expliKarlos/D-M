'use server';

import { createClient } from '@/lib/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export type ChecklistItem = {
    id: string;
    item_id: string;
    item_title: string;
    category: string;
    completed: boolean;
    reminder_days: number | null;
    created_at: string;
};

export async function addToChecklist(data: { itemId: string; itemTitle: string; category: string }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Debes iniciar sesión para guardar items.');
    }

    const { error } = await supabase
        .from('user_checklists')
        .upsert(
            {
                user_id: user.id,
                item_id: data.itemId,
                item_title: data.itemTitle,
                category: data.category,
                completed: false, // Reset completion on re-add? Or keep it? Let's keep existing if updating, but here we probably just ignore if exists or update title.
                // Actually, if we use upsert with ignoreDuplicates: true, it won't reset.
                // But we want to ensure it fails gracefully if already there, or just says "Added".
                // If we want to NOT overwrite 'completed' status, we should probably check existence first OR allow overwrite.
                // Simpler: Just upsert on conflict (user_id, item_id) DO NOTHING.
            },
            { onConflict: 'user_id, item_id', ignoreDuplicates: true }
        )
        .select();

    if (error) {
        console.error('Error adding to checklist:', error);
        throw new Error('Error al guardar en la lista.');
    }

    revalidatePath('/[lang]/profile', 'page');
    return { success: true, message: 'Añadido a tus preparativos personales' };
}

export async function getChecklist() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from('user_checklists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching checklist:', error);
        return [];
    }

    return data as ChecklistItem[];
}

export async function toggleChecklistItem(itemId: string, completed: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase
        .from('user_checklists')
        .update({ completed })
        .eq('user_id', user.id)
        .eq('item_id', itemId);

    if (error) {
        throw new Error('Failed to update status');
    }

    revalidatePath('/[lang]/profile', 'page');
    return { success: true };
}

export async function deleteChecklistItem(itemId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase
        .from('user_checklists')
        .delete()
        .eq('user_id', user.id)
        .eq('item_id', itemId);

    if (error) {
        throw new Error('Failed to delete item');
    }

    revalidatePath('/[lang]/profile', 'page');
    return { success: true };
}

export async function updateChecklistReminder(itemId: string, reminderDays: number | null) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase
        .from('user_checklists')
        .update({ reminder_days: reminderDays })
        .eq('user_id', user.id)
        .eq('item_id', itemId);

    if (error) {
        throw new Error('Failed to update reminder');
    }

    revalidatePath('/[lang]/profile', 'page');
    return { success: true };
}
