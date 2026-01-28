import { NextRequest, NextResponse } from 'next/server';
import { getDriveClient, findOrCreateFolder } from '@/lib/services/google-drive';
import { Readable } from 'stream';

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

        // Resolve "Fiesta", "Ceremonia" into real IDs within the main Wedding Folder
        const targetFolderId = await findOrCreateFolder(folderNameOrId);

        const fileMetadata = {
            name: file.name,
            parents: [targetFolderId]
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
