import { NextResponse } from 'next/server';
import { getRetsClient } from '@/lib/rets-client';
import { COPPER_DOG_OFFICE_ID, COPPER_DOG_ORG_NAME_PREFIX } from '@/app/constants/brokerage';
import featuredIds from '@/app/constants/featured-listings.json';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5 minutes

function getListingId(listing: { L_ListingID?: string; L_DisplayId?: string; ListingID?: string }): string | undefined {
  return listing.L_ListingID || listing.L_DisplayId || listing.ListingID;
}

export async function GET() {
  try {
    const client = getRetsClient();
    const copperDogIds = new Set<string>();

    // 1. Fetch Copper Dog listings by office ID
    let copperDogListings: any[] = [];
    try {
      const rawListings = await client.searchProperties({
        listOfficeId: COPPER_DOG_OFFICE_ID,
        limit: 9,
      });
      copperDogListings = rawListings.filter(
        (listing) => (listing.LO1_OrganizationName || '').startsWith(COPPER_DOG_ORG_NAME_PREFIX)
      );
      copperDogListings.forEach((l) => {
        const id = getListingId(l);
        if (id) copperDogIds.add(id);
      });
    } catch (err: unknown) {
      console.error('[Featured] Failed to fetch Copper Dog listings:', err);
      // Fall through to static-only
    }

    // 2. Fetch static listings by ID, excluding any already in Copper Dog set
    const staticPromises = featuredIds.map((id: string) =>
      client.getListingDetails(id).then((listing) => (listing && !copperDogIds.has(id) ? listing : null))
    );
    const staticResults = await Promise.all(staticPromises);
    const staticListings = staticResults.filter((item): item is NonNullable<typeof item> => item !== null);

    // 3. Combine: Copper Dog first, then static
    const featured = [...copperDogListings, ...staticListings];

    return NextResponse.json(featured);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Featured] API Error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
