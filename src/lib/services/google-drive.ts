import { google } from 'googleapis';
import path from 'path';

/**
 * Initializes the Google Drive API client.
 * Uses SERVICE_ACCOUNT_BASE64 env var if available (for production/Vercel),
 * otherwise falls back to local credentials.json.
 */
export function getDriveClient() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    // 1. Prefer OAuth2 (User Identity) - Required for Personal Gmail Storage Quota
    if (clientId && clientSecret && refreshToken) {
        const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
        oauth2Client.setCredentials({ refresh_token: refreshToken });
        return google.drive({ version: 'v3', auth: oauth2Client });
    }

    // 2. Fallback to Service Account (Legacy / Workspace Shared Drives)
    const credentialsBase64 = process.env.SERVICE_ACCOUNT_BASE64;
    let auth;

    if (credentialsBase64) {
        // ... (existing logic)
        const credentials = JSON.parse(Buffer.from(credentialsBase64, 'base64').toString('utf8'));
        auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/drive.file'],
        });
    } else {
        // Fallback for local development if env var is not set and no OAuth
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
export async function getResumableUploadUrl(fileName: string, mimeType: string, fileSize: number, folderId: string): Promise<string> {
    const drive = getDriveClient();
    return await initiateResumableUpload(fileName, mimeType, fileSize, folderId, drive);
}

async function initiateResumableUpload(fileName: string, mimeType: string, fileSize: number, folderId: string, drive: any): Promise<string> {
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
            'X-Upload-Content-Type': mimeType,
            'X-Upload-Content-Length': fileSize.toString()
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


export const ROOT_FOLDER_ID = '1yKdruuUvKXpbBSwWG0R621CV9Z_rP2dw'; // Shared Folder ID

/**
 * Finds or creates a folder by name inside a parent folder.
 * Returns the folder ID.
 */
export async function findOrCreateFolder(folderName: string, parentId: string = ROOT_FOLDER_ID): Promise<string> {
    const drive = getDriveClient();

    // 1. Search for existing folder
    const query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and '${parentId}' in parents and trachead=false`;

    try {
        const res = await drive.files.list({
            q: query,
            fields: 'files(id, name)',
            spaces: 'drive'
        });

        if (res.data.files && res.data.files.length > 0) {
            return res.data.files[0].id!;
        }

        // 2. Create if not found
        const fileMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentId]
        };

        const folder = await drive.files.create({
            requestBody: fileMetadata,
            fields: 'id'
        });

        return folder.data.id!;

    } catch (error) {
        console.error(`Failed to find/create folder ${folderName}:`, error);
        throw error;
    }
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
