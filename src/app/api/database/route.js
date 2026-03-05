import { NextResponse } from 'next/server';
import { writeData } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function DELETE(request) {
    try {
        // 1. Reset data.json but keep users
        const { readData, writeData } = await import('@/lib/db');
        const currentData = readData();

        const newData = {
            users: currentData.users || [],
            complaints: []
        };

        // Write newData to the database
        const success = writeData(newData);
        if (!success) {
            throw new Error("Failed to write to data.json");
        }

        // 2. Delete all files in public/uploads
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

        if (fs.existsSync(uploadsDir)) {
            const files = fs.readdirSync(uploadsDir);

            for (const file of files) {
                // Skip .gitkeep or other hidden files
                if (file !== '.gitkeep') {
                    try {
                        fs.unlinkSync(path.join(uploadsDir, file));
                    } catch (e) {
                        console.error("Failed to delete file:", file, e);
                    }
                }
            }
        }

        return NextResponse.json({ message: 'Database and uploads flushed successfully' }, { status: 200 });
    } catch (error) {
        console.error("Flush Error:", error);
        return NextResponse.json({ error: 'Internal server error during flush' }, { status: 500 });
    }
}
