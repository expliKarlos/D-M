'use server';

import { createClient } from '@/lib/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateTheme(theme: string) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('User not authenticated');
    }

    const { error } = await supabase
        .from('profiles')
        .update({ theme_preference: theme })
        .eq('id', user.id);

    if (error) {
        console.error('Error updating theme:', error);
        throw new Error('Failed to update theme');
    }

    revalidatePath('/[lang]/profile', 'page');
    return { success: true };
}
