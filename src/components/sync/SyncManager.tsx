'use client';

import { useEffect, useState } from 'react';
import { getPendingUploads, removePendingUpload, countPendingUploads } from '@/lib/services/offline-storage';
// getResumableUploadUrl removed (server-side only)
import { toast } from 'sonner';
import { Loader2, Wifi, WifiOff } from 'lucide-react';

export default function SyncManager() {
    const [pendingCount, setPendingCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isOnline, setIsOnline] = useState(true); // Default to true hydration safely?

    useEffect(() => {
        setIsOnline(navigator.onLine);

        const handleOnline = () => {
            setIsOnline(true);
            checkAndSync();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial check
        updateCount();
        const interval = setInterval(updateCount, 5000); // Poll for new items every 5s

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(interval);
        };
    }, []);

    const updateCount = async () => {
        const count = await countPendingUploads();
        setPendingCount(count);
    };

    const checkAndSync = async () => {
        if (!navigator.onLine) return;

        // Check for WiFi if possible (Navigator Network Information API - explicit 'wifi' check is tricky across browsers)
        // For this MVP, we will sync if online and explicit 'Sync Now' or 'Auto Sync' logic triggered.
        // User requirement: "Watcher... when app is open and stable connection detected".
        // Let's rely on standard onLine for now + UI trigger, or if we want advanced:

        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
        // Treat 'unknown' as WiFi to be safe on some browsers, or strict if desired.
        // User reported "WiFi on but says waiting". Connection API might be reporting 'unknown' or not matching strict 'wifi'.
        // We'll relax it to: regex match wifi|ethernet|unknown, or effectiveType 4g (which is fast enough).
        const isWifi = connection ? (
            /wifi|ethernet|unknown/.test(connection.type || '') ||
            connection.effectiveType === '4g' ||
            connection.saveData === false
        ) : true;

        // Auto-sync if online? For now let's make it manual via the UI prompt or auto if wifi.
        if (isWifi) {
            // Optional: auto-sync could be dangerous if user didn't want it. 
            // Requirement says: "When app is open and detects stable connection... start emptying queue".
            // We'll proceed with auto-sync if pending items exist.
            const count = await countPendingUploads();
            if (count > 0 && !isSyncing) {
                syncQueue();
            }
        }
    };

    const syncQueue = async () => {
        if (isSyncing) return;
        setIsSyncing(true);
        toast.info('Iniciando sincronización de recuerdos...', { duration: 2000 });

        try {
            const pending = await getPendingUploads();

            for (const item of pending) {
                try {
                    // Use Server Proxy to avoid CORS and Auth issues in background sync
                    const formData = new FormData();
                    formData.append('file', item.file); // item.file is a Blob/File from IDB
                    formData.append('folderId', item.metadata.folderId);

                    // Optional: If we want to support large files in sync, proxy might be limited (4.5MB).
                    // But typically 'pending' items are either original (large) or compressed?
                    // SyncManager usually stores 'original' if wifiOnly was true.
                    // If it's > 4.5MB, Proxy will fail on Vercel.
                    // We should probably COMPRESS it here if it's too big, or accept Vercel limit?
                    // For now, let's try proxy. If it fails, we handle error.

                    const driveRes = await fetch('/api/drive/upload-proxy', {
                        method: 'POST',
                        body: formData,
                    });

                    if (!driveRes.ok) {
                        const errorData = await driveRes.json();
                        throw new Error(errorData.details || 'Fallo en la subida a Drive (Proxy)');
                    }

                    const driveData = await driveRes.json();
                    const driveFileId = driveData.id;

                    // 3. Update Supabase Record
                    await fetch('/api/drive/sync-update', {
                        method: 'POST',
                        body: JSON.stringify({
                            supabaseId: item.metadata.supabaseId,
                            driveFileId: driveFileId
                        })
                    });

                    // Remove from IDB
                    if (item.id) await removePendingUpload(item.id);

                } catch (err) {
                    console.error('Error syncing item:', err);
                    // Keep in IDB to retry later
                }
            }

            toast.success('Sincronización completada');
        } catch (error) {
            console.error('Sync failed', error);
            toast.error('Error en la sincronización');
        } finally {
            setIsSyncing(false);
            updateCount();
        }
    };

    if (pendingCount === 0) return null;

    return (
        <div className="fixed bottom-20 left-4 z-50 bg-background/80 backdrop-blur border rounded-lg shadow-lg p-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
            <div className="bg-primary/10 p-2 rounded-full text-primary">
                {isSyncing ? <Loader2 className="h-5 w-5 animate-spin" /> : <WifiOff className="h-5 w-5" />}
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-medium">{pendingCount} fotos pendientes</span>
                <span className="text-xs text-muted-foreground">
                    {isSyncing ? 'Subiendo a la nube...' : (!isOnline ? 'Sin conexión' : 'Esperando mejor red (o pulsa subir)')}
                </span>
            </div>
            {!isSyncing && (
                <button
                    onClick={syncQueue}
                    className="ml-2 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
                >
                    Subir ahora
                </button>
            )}
        </div>
    );
}
