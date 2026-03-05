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

        // Enrich with citizen details
        const enrichedComplaints = complaints.map(complaint => {
            const citizen = data.users.find(u => u.id === complaint.citizenId);
            if (citizen) {
                const { password, ...safeCitizenDetails } = citizen;
                return { ...complaint, citizen: safeCitizenDetails };
            }
            return complaint;
        });

        // Sort by newest first
        enrichedComplaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return NextResponse.json({ complaints: enrichedComplaints }, { status: 200 });
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
        const mediaFiles = formData.getAll('media'); // Array of File objects

        if (!citizenId || !category || !description || !location || mediaFiles.length === 0) {
            return NextResponse.json({ error: 'All fields and at least one media file are required' }, { status: 400 });
        }

        // Save media files
        const publicDir = path.join(process.cwd(), 'public');
        const uploadsDir = path.join(publicDir, 'uploads');

        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const mediaPaths = [];

        for (const file of mediaFiles) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            // Sanitize filename to avoid weird characters
            const safeFilename = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
            const filename = `${uniqueSuffix}-${safeFilename}`;
            const imagePath = path.join(uploadsDir, filename);

            fs.writeFileSync(imagePath, buffer);
            mediaPaths.push(`/uploads/${filename}`);
        }

        const data = readData();
        const newComplaint = {
            id: crypto.randomUUID(),
            citizenId,
            category,
            description,
            location,
            mediaPaths,
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
