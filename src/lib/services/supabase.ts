import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Singleton Supabase client for client-side usage.
 * Uses createBrowserClient to ensure auth state (like PKCE verifiers) works with cookies/SSR.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

/**
 * Uploads an image to a Supabase bucket.
 * Returns the public URL of the uploaded file.
 */
export async function uploadImage(file: File, folder: string = 'participation-gallery', bucket: string = 'photos') {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

    return publicUrl;
}

export async function createImageRecord(data: {
    url_optimized: string;
    drive_file_id: string;
    category_id: string;
    author_id: string;
    author_name: string;
    timestamp: number;
}) {
    const { data: insertedData, error } = await supabase
        .from('images')
        .insert({
            url_optimized: data.url_optimized,
            drive_file_id: data.drive_file_id,
            category_id: data.category_id,
            author_id: data.author_id,
            author_name: data.author_name,
            timestamp: new Date(data.timestamp).toISOString(),
            // Map legacy fields if table schematic matches, otherwise rely on new columns
            // Assuming table has generic JSON or flexible schema, but strictly adhering to our migration
        })
        .select()
        .single();

    if (error) {
        console.error('Supabase DB Insert Error:', error);
        throw error;
    }

    return insertedData;
}
