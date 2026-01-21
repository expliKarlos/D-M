// Minimal Service Worker for PWA
self.addEventListener('install', (event) => {
    console.log('SW installed');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('SW activated');
});

self.addEventListener('fetch', (event) => {
    // Basic fetch listener (required for PWA)
});
