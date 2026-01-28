import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/services/firebase-admin';

const MOMENTS_COLLECTION = 'moments';

export async function POST(req: NextRequest) {
    try {
        const { name } = await req.json();
        if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

        const db = adminDb();
        if (!db) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
        }

        const docRef = await db.collection(MOMENTS_COLLECTION).add({
            name,
            icon: '📁', // Default icon
            order: 99,   // Default order
            visible: true
        });

        return NextResponse.json({ id: docRef.id, name });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { id, name, visible } = await req.json();
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        const db = adminDb();
        if (!db) {
            return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
        }

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (visible !== undefined) updateData.visible = visible;

        await db.collection(MOMENTS_COLLECTION).doc(id).update(updateData);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update folder' }, { status: 500 });
    }
}
