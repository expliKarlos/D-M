import { NextRequest, NextResponse } from 'next/server';
import { getResumableUploadUrl } from '@/lib/services/google-drive';

export const runtime = 'nodejs';

// The folder ID provided by the user: 1Q_VfZnAp8bAeaccXHjUsJFgUfPn_RlpB
const DEFAULT_DRIVE_FOLDER_ID = '1Q_VfZnAp8bAeaccXHjUsJFgUfPn_RlpB';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { fileName, fileType, folderId } = body;

        if (!fileName || !fileType) {
            return NextResponse.json(
                { error: 'Missing fileName or fileType' },
                { status: 400 }
            );
        }

        const targetFolderId = folderId || DEFAULT_DRIVE_FOLDER_ID;

        // Generate the Resumable Session URI (Upload URL)
        const uploadUrl = await getResumableUploadUrl(fileName, fileType, targetFolderId);

        return NextResponse.json({
            uploadUrl,
            method: 'PUT', // The client must use PUT to send the binary data to this URL
            expiresIn: 604800 // Resumable sessions usually last 1 week, but good to act fast
        });

    } catch (error) {
        console.error('Error in /api/drive/upload-url:', error);
        return NextResponse.json(
            { error: 'Failed to generate upload URL' },
            { status: 500 }
        );
    }
}
