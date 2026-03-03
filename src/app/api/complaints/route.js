import { NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/db';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const citizenId = searchParams.get('citizenId');
        const data = readData();

        let complaints = data.complaints;
        if (citizenId) {
            complaints = complaints.filter(c => c.citizenId === citizenId);
        }

        // Sort by newest first
        complaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return NextResponse.json({ complaints }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const formData = await request.formData();
        const citizenId = formData.get('citizenId');
        const category = formData.get('category');
        const description = formData.get('description');
        const location = formData.get('location'); // comma-separated lat/lng
        const image = formData.get('image'); // File object

        if (!citizenId || !category || !description || !location || !image) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        // Save image
        const publicDir = path.join(process.cwd(), 'public');
        const uploadsDir = path.join(publicDir, 'uploads');

        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        // Sanitize filename to avoid weird characters
        const safeFilename = image.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
        const filename = `${uniqueSuffix}-${safeFilename}`;
        const imagePath = path.join(uploadsDir, filename);

        fs.writeFileSync(imagePath, buffer);

        const data = readData();
        const newComplaint = {
            id: crypto.randomUUID(),
            citizenId,
            category,
            description,
            location,
            imagePath: `/uploads/${filename}`,
            status: 'Pending',
            createdAt: new Date().toISOString()
        };

        data.complaints.push(newComplaint);
        writeData(data);

        return NextResponse.json({ complaint: newComplaint }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
