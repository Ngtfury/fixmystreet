import { NextResponse } from 'next/server';
import { writeData } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function DELETE(request) {
    try {
        // 1. Reset data.json
        const emptyData = {
            users: [],
            complaints: []
        };

        // Write empty arrays to the database
        const success = writeData(emptyData);
        if (!success) {
            throw new Error("Failed to write to data.json");
        }

        // 2. Delete all files in public/uploads
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

        if (fs.existsSync(uploadsDir)) {
            const files = fs.readdirSync(uploadsDir);

            for (const file of files) {
                // Skip .gitkeep or other hidden files if you want, but for a true flush we delete everything
                if (file !== '.gitkeep') {
                    fs.unlinkSync(path.join(uploadsDir, file));
                }
            }
        }

        return NextResponse.json({ message: 'Database and uploads flushed successfully' }, { status: 200 });
    } catch (error) {
        console.error("Flush Error:", error);
        return NextResponse.json({ error: 'Internal server error during flush' }, { status: 500 });
    }
}
