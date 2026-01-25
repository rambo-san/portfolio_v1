/**
 * UTILITY: Local Image Upload
 * 
 * Uploads images to the local /api/upload endpoint which saves files to 'public/uploads'.
 * This bypasses Firebase Storage completely.
 */

export async function uploadImage(file: File, path: string): Promise<string> {
    console.log(`[Upload] Sending ${file.name} to local API...`);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path); // Optional, if we want to organize folders later

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Upload failed');
        }

        const data = await response.json();
        console.log('[Upload] Success! URL:', data.url);
        return data.url;

    } catch (error) {
        console.error('[Upload] Error:', error);
        throw error;
    }
}
