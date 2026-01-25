import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validate file type (image only)
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure directory exists: public/uploads
        // We use 'uploads' instead of 'resources/images' to keep user-uploaded content separate
        const relativeUploadDir = '/uploads';
        const uploadDir = join(process.cwd(), 'public', relativeUploadDir);

        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Ignore error if directory exists
        }

        // Create unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const saneFilename = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        const filename = `${uniqueSuffix}-${saneFilename}`;
        const filepath = join(uploadDir, filename);

        // Write file to filesystem
        await writeFile(filepath, buffer);

        // Return the public URL
        const publicUrl = `${relativeUploadDir}/${filename}`;

        return NextResponse.json({ url: publicUrl });

    } catch (error) {
        console.error('Upload failed:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
