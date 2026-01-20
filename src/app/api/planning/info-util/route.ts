import { NextRequest, NextResponse } from 'next/server';
import { getInfoUtil } from '@/lib/services/planning-concierge';

export const runtime = 'nodejs';

export async function GET() {
    try {
        const data = await getInfoUtil();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in info-util route:', error);
        return NextResponse.json(
            { error: 'Failed to fetch useful info' },
            { status: 500 }
        );
    }
}
