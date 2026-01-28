import { google } from 'googleapis';
import path from 'path';

/**
 * Initializes the Google Drive API client.
 * Uses SERVICE_ACCOUNT_BASE64 env var if available (for production/Vercel),
 * otherwise falls back to local credentials.json.
 */
function getDriveClient() {
    const credentialsBase64 = process.env.SERVICE_ACCOUNT_BASE64;
    let auth;

    if (credentialsBase64) {
        const credentials = JSON.parse(Buffer.from(credentialsBase64, 'base64').toString('utf8'));
        auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/drive.file'],
        });
    } else {
        // Fallback for local development if env var is not set
        auth = new google.auth.GoogleAuth({
            keyFile: path.join(process.cwd(), 'credentials.json'),
            scopes: ['https://www.googleapis.com/auth/drive.file'],
        });
    }

    return google.drive({ version: 'v3', auth });
}

/**
 * Generates a Resumable Upload URL for a file to be uploaded directly to Google Drive.
 * This URL allows the client to upload large files without passing through the Next.js server.
 */
export async function getResumableUploadUrl(fileName: string, mimeType: string, folderId: string): Promise<string> {
    const drive = getDriveClient();
    return await initiateResumableUpload(fileName, mimeType, folderId, drive);
}

async function initiateResumableUpload(fileName: string, mimeType: string, folderId: string, drive: any): Promise<string> {
    const auth = await drive.context._options.auth.getClient();
    const accessToken = (await auth.getAccessToken()).token;

    if (!accessToken) throw new Error("Failed to get access token");

    const metadata = {
        name: fileName,
        description: "Uploaded via DM App Dual-Upload",
        parents: [folderId],
        mimeType: mimeType
    };

    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata)
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to initiate upload session: ${response.status} ${text}`);
    }

    const uploadUrl = response.headers.get('Location');

    if (!uploadUrl) {
        throw new Error("No upload URL returned from Drive API");
    }

    return uploadUrl;
}

/**
 * Permanently deletes a file from Google Drive.
 * Used by Admin Dashboard when deleting a photo.
 */
export async function deleteFile(fileId: string): Promise<void> {
    const drive = getDriveClient();
    try {
        await drive.files.delete({
            fileId: fileId
        });
    } catch (error) {
        console.error(`Failed to delete Drive file ${fileId}:`, error);
        throw error;
    }
}
