import { NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/db';

export async function PATCH(request, context) {
    try {
        const { id } = await context.params;
        const contentType = request.headers.get('content-type') || '';

        let status, feedbackRating, feedbackReview, proofImagePath;

        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            status = formData.get('status');
            const proofImage = formData.get('proofImage');

            if (proofImage && proofImage.size > 0) {
                const fs = await import('fs');
                const path = await import('path');
                const publicDir = path.join(process.cwd(), 'public');
                const uploadsDir = path.join(publicDir, 'uploads');

                if (!fs.existsSync(uploadsDir)) {
                    fs.mkdirSync(uploadsDir, { recursive: true });
                }

                const bytes = await proofImage.arrayBuffer();
                const buffer = Buffer.from(bytes);
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const safeFilename = proofImage.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
                const filename = `proof-${uniqueSuffix}-${safeFilename}`;
                const imagePath = path.join(uploadsDir, filename);

                fs.writeFileSync(imagePath, buffer);
                proofImagePath = `/uploads/${filename}`;
            }
        } else {
            const body = await request.json();
            status = body.status;
            feedbackRating = body.feedbackRating;
            feedbackReview = body.feedbackReview;
        }

        const data = readData();
        const complaintIndex = data.complaints.findIndex(c => c.id === id);

        if (complaintIndex === -1) {
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
        }

        if (status) {
            data.complaints[complaintIndex].status = status;
        }

        if (proofImagePath) {
            // Using different keys depending on the status
            if (status === 'In Progress') {
                data.complaints[complaintIndex].progressImagePath = proofImagePath;
            } else if (status === 'Resolved') {
                data.complaints[complaintIndex].resolvedImagePath = proofImagePath;
            }
        }

        if (feedbackRating) {
            data.complaints[complaintIndex].feedbackRating = feedbackRating;
        }

        if (feedbackReview) {
            data.complaints[complaintIndex].feedbackReview = feedbackReview;
        }

        writeData(data);

        return NextResponse.json({ complaint: data.complaints[complaintIndex] }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
