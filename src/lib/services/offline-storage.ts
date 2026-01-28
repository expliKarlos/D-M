import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface PendingUploadMetadata {
    fileName: string;
    folderId: string;
    mimeType: string;
    supabaseId: string; // To update the record later
    authorId: string;
    fileSize?: number;
}

interface PendingUpload {
    id?: number;
    file: Blob;
    metadata: PendingUploadMetadata;
    timestamp: number;
    status: 'pending' | 'uploading' | 'failed';
}

interface DeferredUploadDB extends DBSchema {
    pending_uploads: {
        key: number;
        value: PendingUpload;
        indexes: { 'by-status': string };
    };
}

const DB_NAME = 'dm-app-offline-db';
const STORE_NAME = 'pending_uploads';

async function getDB(): Promise<IDBPDatabase<DeferredUploadDB>> {
    return openDB<DeferredUploadDB>(DB_NAME, 1, {
        upgrade(db) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            store.createIndex('by-status', 'status');
        },
    });
}

export async function savePendingUpload(file: File | Blob, metadata: PendingUploadMetadata): Promise<number> {
    const db = await getDB();
    return db.add(STORE_NAME, {
        file,
        metadata,
        timestamp: Date.now(),
        status: 'pending',
    });
}

export async function getPendingUploads(): Promise<PendingUpload[]> {
    const db = await getDB();
    return db.getAllFromIndex(STORE_NAME, 'by-status', 'pending');
}

export async function removePendingUpload(id: number): Promise<void> {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
}

export async function countPendingUploads(): Promise<number> {
    const db = await getDB();
    return db.countFromIndex(STORE_NAME, 'by-status', 'pending');
}
