import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Singleton Supabase client for client-side usage.
 * Uses createBrowserClient to ensure auth state (like PKCE verifiers) works with cookies/SSR.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

/**
 * Uploads an image to the 'wedding-gallery' bucket.
 * Returns the public URL of the uploaded file.
 */
export async function uploadImage(file: File, folder: string = 'participation-gallery') {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('wedding-gallery')
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
        .from('wedding-gallery')
        .getPublicUrl(filePath);

    return publicUrl;
}
