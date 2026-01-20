import { NextRequest, NextResponse } from 'next/server';
import { getInfoIndia } from '@/lib/services/planning-concierge';

export const runtime = 'nodejs';

export async function GET() {
    try {
        const data = await getInfoIndia();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in info-india route:', error);
        return NextResponse.json(
            { error: 'Failed to fetch India info' },
            { status: 500 }
        );
    }
}
