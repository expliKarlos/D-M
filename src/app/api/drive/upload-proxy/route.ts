import { NextRequest, NextResponse } from 'next/server';
import { getDriveClient, findOrCreateFolder } from '@/lib/services/google-drive';
import { Readable } from 'stream';

export const config = {
    api: {
        bodyParser: false, // Disabling body parser to handle stream? Next.js App Router doesn't use this config usually.
        // App router handles requests as web standard Request.
    }
};

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const folderNameOrId = formData.get('folderId') as string;

        if (!file || !folderNameOrId) {
            return NextResponse.json({ error: 'Missing file or folderId' }, { status: 400 });
        }

        // Vercel Limit Check
        if (file.size > 4.5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File too large for server proxy (Max 4.5MB)' }, { status: 413 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const stream = new Readable();
        stream.push(buffer);
        stream.push(null);

        const drive = getDriveClient();

        // I'll update the logic:

        // logic:
        // const { findOrCreateFolder } = await import('@/lib/services/google-drive');
        // targetFolderId = await findOrCreateFolder(folderId);

        const fileMetadata = {
            name: file.name,
            parents: [targetFolderId] // Will be replaced by resolved ID
        };

        const media = {
            mimeType: file.type,
            body: stream
        };

        // Server-side upload (No CORS issues)
        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id'
        });

        return NextResponse.json({ id: response.data.id });

    } catch (error: any) {
        console.error('Proxy Upload Error:', error);
        return NextResponse.json({
            error: 'Upload failed',
            details: error.message
        }, { status: 500 });
    }
}
