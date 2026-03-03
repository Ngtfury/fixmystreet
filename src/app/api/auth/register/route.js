import { NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, email, password, role } = body;

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const data = readData();

        if (data.users.some(u => u.email === email)) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const newUser = {
            id: crypto.randomUUID(),
            name,
            email,
            password, // In a real app, you would hash this
            role // "citizen" or "authority"
        };

        data.users.push(newUser);
        writeData(data);

        const { password: _, ...userWithoutPassword } = newUser;

        return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
