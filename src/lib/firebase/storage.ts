/**
 * UTILITY: Local Filesystem Upload
 * 
 * Uploads images to the project's public/uploads directory.
 * This is zero-config and stores files directly in your codebase.
 */

export async function uploadImage(file: File, path: string): Promise<string> {
    console.log(`[Upload] Saving ${file.name} to codebase...`);

    try {
        // Create a unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const saneFilename = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        // Include the path in the filename for better organization in Vercel Blob dashboard
        const filename = `${path.replace(/\//g, '-')}-${uniqueSuffix}-${saneFilename}`;

        // Send to our Vercel Blob API endpoint
        const response = await fetch(`/api/upload?filename=${filename}`, {
            method: 'POST',
            body: file,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || error.message || 'Upload failed');
        }

        const newBlob = await response.json();
        console.log('[Upload] Success! URL:', newBlob.url);

        // This 'url' is the public Vercel Blob URL
        return newBlob.url;

    } catch (error) {
        console.error('[Upload] Error:', error);
        throw error;
    }
}
