import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request): Promise<NextResponse> {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
        return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    try {
        // Handle direct binary body upload (which storage.ts uses)
        const arrayBuffer = await request.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (buffer.length === 0) {
            return NextResponse.json({ error: 'Empty file received' }, { status: 400 });
        }

        // Ensure the upload directory exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Create a safe unique filename
        const safeFilename = filename.replace(/[^a-z0-9.-]/gi, '_').toLowerCase();
        const filePath = path.join(uploadDir, safeFilename);

        // Write the file
        fs.writeFileSync(filePath, buffer);

        // Return the relative URL from public
        return NextResponse.json({ url: `/uploads/${safeFilename}` });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
    }
}
