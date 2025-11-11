import { NextResponse } from 'next/server';
import { getListings } from '@/lib/rets';

export async function GET() {
  const listings = await getListings();
  return NextResponse.json(listings);
}
