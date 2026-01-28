import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';
import { deleteFile as deleteDriveFile } from '@/lib/services/google-drive'; // We need to export this or implement it inline if I missed it in step 4

export const runtime = 'nodejs'; // Required for googleapis

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * DELETE: Remove image from all systems
 * Body: { id: string }
 */
export async function DELETE(req: NextRequest) {
    try {
        const { id } = await req.json();

        if (!id) return NextResponse.json({ error: 'Missing Image ID' }, { status: 400 });

        // 1. Get Image Metadata
        const { data: image, error: fetchError } = await supabase
            .from('images')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !image) {
            return NextResponse.json({ error: 'Image not found' }, { status: 404 });
        }

        const errors: string[] = [];

        // 2. Delete from Google Drive
        if (image.drive_file_id) {
            try {
                await deleteDriveFile(image.drive_file_id);
            } catch (err) {
                console.error('Drive delete error:', err);
                errors.push('Failed to delete from Drive');
            }
        }

        // 3. Delete from Supabase Storage
        // Extract filename from URL... simplified approach:
        // URL: https://xyz.supabase.co/storage/v1/object/public/photos/participation-gallery/xyz.webp
        try {
            const urlPath = image.url_optimized.split('/storage/v1/object/public/photos/')[1];
            if (urlPath) {
                const { error: storageError } = await supabase.storage
                    .from('photos')
                    .remove([urlPath]);

                if (storageError) throw storageError;
            }
        } catch (err) {
            console.error('Storage delete error:', err);
            // Non-critical if DB delete succeeds, but good to track
        }

        // 4. Delete from Supabase Database
        const { error: dbError } = await supabase
            .from('images')
            .delete()
            .eq('id', id);

        if (dbError) throw dbError;

        return NextResponse.json({ success: true, errors: errors.length > 0 ? errors : undefined });

    } catch (error) {
        console.error('Admin Action Error:', error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

/**
 * PATCH: Move image to another category/folder
 * Body: { id: string, categoryId: string }
 */
export async function PATCH(req: NextRequest) {
    try {
        const { id, categoryId } = await req.json();

        if (!id || !categoryId) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const { error } = await supabase
            .from('images')
            .update({ category_id: categoryId })
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: 'Update Failed' }, { status: 500 });
    }
}
