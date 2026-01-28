import { NextRequest, NextResponse } from 'next/server';
import { getResumableUploadUrl } from '@/lib/services/google-drive';

export const runtime = 'nodejs';

// The folder ID provided by the user: 1Q_VfZnAp8bAeaccXHjUsJFgUfPn_RlpB
const DEFAULT_DRIVE_FOLDER_ID = '1Q_VfZnAp8bAeaccXHjUsJFgUfPn_RlpB';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { fileName, fileType, fileSize, folderId } = body;

        if (!fileName || !fileType || !fileSize) {
            return NextResponse.json(
                { error: 'Missing fileName, fileType, or fileSize' },
                { status: 400 }
            );
        }

        // Validate folderId (Basic check: Drive IDs are usually long ~33 chars)
        // If folderId is a name like 'Fiesta', fallback to default.
        const isValidDriveId = folderId && folderId.length > 20;
        const targetFolderId = isValidDriveId ? folderId : DEFAULT_DRIVE_FOLDER_ID;

        // Generate the Resumable Session URI (Upload URL)
        const uploadUrl = await getResumableUploadUrl(fileName, fileType, fileSize, targetFolderId);

        return NextResponse.json({
            uploadUrl,
            method: 'PUT', // The client must use PUT to send the binary data to this URL
            expiresIn: 604800 // Resumable sessions usually last 1 week, but good to act fast
        });

    } catch (error: any) {
        console.error('Error in /api/drive/upload-url:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate upload URL',
                details: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}
