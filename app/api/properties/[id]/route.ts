import { NextRequest, NextResponse } from 'next/server';
import { RetsClient } from '@/lib/rets-client';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const loginUrl = process.env.RETS_LOGIN_URL;
  const username = process.env.RETS_USERNAME;
  const password = process.env.RETS_PASSWORD;

  if (!loginUrl || !username || !password) {
    return NextResponse.json({ error: 'RETS credentials not configured' }, { status: 500 });
  }

  const client = new RetsClient({ loginUrl, username, password });

  try {
    await client.login();
    
    const listing = await client.getListingDetails(id);
    
    await client.logout();

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    return NextResponse.json(listing);
  } catch (error: any) {
    console.error('API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
