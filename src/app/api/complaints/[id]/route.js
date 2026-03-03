import { NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/db';

export async function PATCH(request, context) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const { status, feedbackRating } = body;

        const data = readData();
        const complaintIndex = data.complaints.findIndex(c => c.id === id);

        if (complaintIndex === -1) {
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
        }

        if (status) {
            data.complaints[complaintIndex].status = status;
        }

        if (feedbackRating) {
            data.complaints[complaintIndex].feedbackRating = feedbackRating;
        }

        writeData(data);

        return NextResponse.json({ complaint: data.complaints[complaintIndex] }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
