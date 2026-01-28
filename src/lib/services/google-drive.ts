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
        // Fallback for local development if env var is not set, though the user mentioned credentials.json is present
        // It's safer to rely on the standard GoogleAuth discovery but explicit path is good for clarity
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
 * 
 * @param fileName Name of the file to uploaded
 * @param mimeType MIME type of the file
 * @param folderId ID of the Google Drive folder where the file will be placed
 * @returns The session URI (upload URL)
 */
export async function getResumableUploadUrl(fileName: string, mimeType: string, folderId: string): Promise<string> {
    const drive = getDriveClient();

    // 1. Create the metadata for the file (this creates a 'placeholder' with no content yet)
    // We start a resumable session.
    // Note: To get the session URI, we need to make a request with 'uploadType=resumable'
    // but the googleapis node library abstracts this slightly differently. 
    // We will use the `create` method but importantly we want the *location* header for the upload.

    // Actually, the best way with the library to get the URL for *client-side* upload 
    // is to perform the initiate request manually or inspect the response object carefully.
    // However, a common pattern is to let the server proxy the start and return the `location` header.

    const requestBody = {
        name: fileName,
        parents: [folderId],
        mimeType: mimeType,
    };

    try {
        const response = await drive.files.create({
            requestBody,
            media: {
                mimeType,
                // We provide an empty body here just to initialize the intent, 
                // but strictly speaking for a *resumable session URL* to be returned for *external* use,
                // we strictly need to construct the request such that we don't upload data yet.
                // The standard googleapis library `create` tries to do it all.
                // We might need to use `axios` or `fetch` for the initiation if the library doesn't expose the session URI easily.
                // BUT, looking at documentation, we can pass a specific stream or body.

                // Let's try a direct approach for the session initiation to be robust and strictly control the headers.
            },
            fields: 'id',
        }, {
            // This is crucial: tell axios (underlying fetcher) to not follow the redirect 
            // and to return the headers.
            responseType: 'stream',
        });

        // Wait, the standard library is designed for server-side upload. 
        // For generating a *Pre-signed* URL equivalent (Resumable Session URI), we need to manually hit the endpoint.
        // Let's implement a clean manual fetch for the session URI using the auth client.

        return await initiateResumableUpload(fileName, mimeType, folderId, drive);

    } catch (error) {
        console.error('Error generating upload URL:', error);
        throw error;
    }
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
            // 'X-Upload-Content-Type': mimeType, // Optional but good practice
            // 'X-Upload-Content-Length': size // We might not know exact size yet if we want chunks, but usually client knows. 
            // For now let's omit size to allow arbitrary chunked uploads if needed, or update if we demand it.
        },
        body: JSON.stringify(metadata)
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to initiate upload session: ${response.status} ${text}`);
    }

    const uploadUrl = response.headers.get('Location');

});

if (!uploadUrl) {
    throw new Error("No upload URL returned from Drive API");
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
