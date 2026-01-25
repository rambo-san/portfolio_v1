/**
 * UTILITY: Vercel Blob Image Upload
 * 
 * Uploads images to Vercel Blob via our API route.
 * This is free and works perfectly with Vercel deployment.
 */

export async function uploadImage(file: File, path: string): Promise<string> {
    console.log(`[Upload] Sending ${file.name} to Vercel Blob...`);

    try {
        // Create a unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const saneFilename = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        const filename = `${uniqueSuffix}-${saneFilename}`;

        // Send to our Vercel Blob API endpoint
        const response = await fetch(`/api/upload?filename=${filename}`, {
            method: 'POST',
            body: file,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Upload failed');
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
