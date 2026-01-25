import { storage } from './config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * UTILITY: Firebase Storage Image Upload
 * 
 * Uploads images directly to Firebase Storage. 
 * This is required for Vercel deployment as the filesystem is read-only.
 */

export async function uploadImage(file: File, path: string): Promise<string> {
    console.log(`[Upload] Sending ${file.name} to Firebase Storage...`);

    try {
        // Create a unique filename to avoid collisions
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const saneFilename = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        const filename = `${uniqueSuffix}-${saneFilename}`;

        // Create a reference to the storage location
        // Default to uploads folder if path is not specified
        const folder = path || 'uploads';
        const storageRef = ref(storage, `${folder}/${filename}`);

        // Upload the file
        const snapshot = await uploadBytes(storageRef, file);
        console.log('[Upload] Upload successful');

        // Get the public download URL
        const downloadUrl = await getDownloadURL(snapshot.ref);
        console.log('[Upload] Public URL:', downloadUrl);

        return downloadUrl;

    } catch (error) {
        console.error('[Upload] Error:', error);
        throw error;
    }
}
