'use server';

import fs from 'fs';
import path from 'path';

export type InfoCategory = 'Info' | 'Lugares';

export async function getInfoHubImages(category: InfoCategory) {
    const infoDir = path.join(process.cwd(), 'public', 'info');

    try {
        const files = await fs.promises.readdir(infoDir);

        // Filter by category
        // Info -> info*
        // Lugares -> ciudad*
        const prefix = category === 'Info' ? 'info' : 'ciudad';

        const filteredImages = files
            .filter(file => file.toLowerCase().startsWith(prefix))
            .map(file => `/info/${file}`)
            .sort(); // Sort to keep consistent order

        return filteredImages;
    } catch (error) {
        console.error('Error reading info directory:', error);
        return [];
    }
}
