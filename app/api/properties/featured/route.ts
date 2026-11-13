import { NextResponse } from 'next/server';
import { getFeaturedListings } from '@/lib/featured-listings';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5 minutes

export async function GET() {
  try {
    return NextResponse.json(await getFeaturedListings());
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Featured] API Error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
