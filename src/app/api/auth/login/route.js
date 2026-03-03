import { NextResponse } from 'next/server';
import { readData } from '@/lib/db';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const data = readData();
        const user = data.users.find(u => u.email === email && u.password === password);

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Omit password from response
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({ user: userWithoutPassword }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
