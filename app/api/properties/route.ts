import { NextRequest, NextResponse } from 'next/server';
import { RetsClient } from '@/lib/rets-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const loginUrl = process.env.RETS_LOGIN_URL;
  const username = process.env.RETS_USERNAME;
  const password = process.env.RETS_PASSWORD;

  if (!loginUrl || !username || !password) {
    return NextResponse.json({ error: 'RETS credentials not configured' }, { status: 500 });
  }

  const searchParams = request.nextUrl.searchParams;
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const city = searchParams.get('city') || undefined;
  const minBeds = searchParams.get('minBeds') ? Number(searchParams.get('minBeds')) : undefined;
  const minBaths = searchParams.get('minBaths') ? Number(searchParams.get('minBaths')) : undefined;
  const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 20;

  const client = new RetsClient({ loginUrl, username, password });

  try {
    // Login is now handled within the cached searchProperties function
    const listings = await client.searchProperties({
      minPrice,
      maxPrice,
      city,
      minBeds,
      minBaths,
      limit
    });

    // Logout is also handled within the cached function
    return NextResponse.json(listings);
  } catch (error: any) {
    console.error('API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}