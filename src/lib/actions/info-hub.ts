'use server';

import fs from 'fs';
import path from 'path';

export type InfoCategory = 'Info' | 'Lugares';

export async function getInfoHubImages(category: InfoCategory) {
    // Use process.cwd() to correctly resolve paths in Vercel/Node environment
    const infoDir = path.join(process.cwd(), 'public', 'info');

    console.log(`[InfoHub] Scanning directory: ${infoDir}`);

    try {
        // Check if directory exists
        if (!fs.existsSync(infoDir)) {
            console.warn(`[InfoHub] Directory not found: ${infoDir}`);
            return [];
        }

        const files = await fs.promises.readdir(infoDir);

        // Filter by prefix (case-insensitive)
        const prefix = category === 'Info' ? 'info' : 'ciudad';

        // Robust filtering for common image extensions (case-insensitive)
        const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp'];

        const filteredImages = files
            .filter(file => {
                const lowerFile = file.toLowerCase();
                const hasCorrectPrefix = lowerFile.startsWith(prefix);
                const hasValidExtension = imageExtensions.some(ext => lowerFile.endsWith(ext));
                return hasCorrectPrefix && hasValidExtension;
            })
            .map(file => `/info/${file}`)
            .sort(); // Consistent order is important for preloading logic

        console.log(`[InfoHub] Found ${filteredImages.length} images for category: ${category}`);

        return filteredImages;
    } catch (error) {
        console.error(`[InfoHub] Critical error reading info directory:`, error);
        return [];
    }
}
