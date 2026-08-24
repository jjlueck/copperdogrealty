import type { PropertyFilter } from './rets-client';

/**
 * Deterministic listings used when RETS_FIXTURES=1.
 *
 * The e2e suite has no MLS credentials in CI, so the real client throws and
 * every properties page renders its error state instead of a grid. These
 * fixtures let the property list, detail page, and Open Graph metadata be
 * asserted without a live RETS server (and without the suite depending on
 * whatever the MLS happens to be returning today).
 *
 * Photos are local public/ paths on purpose: metadataBase in app/layout.tsx
 * resolves them to absolute og:image URLs, so no external network is needed.
 */
export const FIXTURE_PHOTOS = ['/images/hero-home.jpg', '/images/little-free-library.jpg'];

export const FIXTURE_LISTINGS: Record<string, any>[] = [
  {
    L_ListingID: 'E2E-1001',
    L_DisplayId: 'E2E-1001',
    L_AddressNumber: '1715',
    L_AddressStreet: 'Hill Ave',
    L_City: 'Spirit Lake',
    L_State: 'IA',
    L_Zip: '51360',
    L_AskingPrice: '425000',
    L_Status: 'Active',
    L_StatusCatID: '1',
    L_InputDate: '2026-06-01',
    L_ListingDate: '2026-06-01',
    LM_Int1_11: '3',
    LM_Dec_35: '2',
    LM_Int2_4: '1850',
    LM_Int2_13: '1998',
    LR_remarks3636:
      'Bright three-bedroom near the lake with a fenced yard and a covered porch.',
    LFD_ArchitecturalStyle_5002: 'Ranch',
    LFD_Heating_5027: 'Forced Air',
    LFD_WaterSource_5043: 'City',
    LFD_Sewer_5040: 'City',
    LA1_UserFirstName: 'Beth',
    LA1_UserLastName: 'Hild',
    LA1_PhoneNumber1: '712-555-0100',
    LO1_OrganizationName: 'Copper Dog Realty',
    photos: FIXTURE_PHOTOS,
  },
  {
    L_ListingID: 'E2E-1002',
    L_DisplayId: 'E2E-1002',
    L_AddressNumber: '204',
    L_AddressStreet: 'Lakeshore Dr',
    L_City: 'Okoboji',
    L_State: 'IA',
    L_Zip: '51355',
    L_AskingPrice: '689000',
    L_Status: 'Active',
    L_StatusCatID: '1',
    L_InputDate: '2026-05-14',
    L_ListingDate: '2026-05-14',
    LM_Int1_11: '4',
    LM_Dec_35: '3',
    LM_Int2_4: '2600',
    LM_Int2_13: '2012',
    LR_remarks3636:
      'Four-bedroom walkout with lake views, a two-stall garage, and a finished basement.',
    LFD_ArchitecturalStyle_5002: 'Two Story',
    LFD_Heating_5027: 'Forced Air',
    LFD_GarageType_5022: 'Attached',
    LA1_UserFirstName: 'Beth',
    LA1_UserLastName: 'Hild',
    LA1_PhoneNumber1: '712-555-0100',
    LO1_OrganizationName: 'Copper Dog Realty',
    photos: FIXTURE_PHOTOS,
  },
  {
    L_ListingID: 'E2E-1003',
    L_DisplayId: 'E2E-1003',
    L_AddressNumber: '87',
    L_AddressStreet: 'Prairie Ln',
    L_City: 'Milford',
    L_State: 'IA',
    L_Zip: '51351',
    L_AskingPrice: '245000',
    L_Status: 'Active',
    L_StatusCatID: '1',
    L_InputDate: '2026-04-02',
    L_ListingDate: '2026-04-02',
    LM_Int1_11: '2',
    LM_Dec_35: '1',
    LM_Int2_4: '1120',
    LM_Int2_13: '1976',
    LR_remarks3636: 'Starter home on a quiet street, walking distance to the park.',
    LA1_UserFirstName: 'Beth',
    LA1_UserLastName: 'Hild',
    LA1_PhoneNumber1: '712-555-0100',
    LO1_OrganizationName: 'Lakes Area Brokerage',
    photos: FIXTURE_PHOTOS,
  },
];

export const fixtureListingId = (listing: Record<string, any>) =>
  listing.L_ListingID || listing.L_DisplayId;

export function filterFixtureListings(
  listings: Record<string, any>[],
  filters: PropertyFilter
): Record<string, any>[] {
  let result = [...listings];

  if (filters.minPrice !== undefined) {
    result = result.filter((l) => Number(l.L_AskingPrice) >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    result = result.filter((l) => Number(l.L_AskingPrice) <= filters.maxPrice!);
  }
  if (filters.minBeds !== undefined) {
    result = result.filter((l) => Number(l.LM_Int1_11) >= filters.minBeds!);
  }
  if (filters.minBaths !== undefined) {
    result = result.filter((l) => Number(l.LM_Dec_35) >= filters.minBaths!);
  }
  if (filters.city) {
    // The real client filters on MLS city codes; fixtures match on name so the
    // city picker can be exercised end to end.
    const wanted = filters.city
      .split(',')
      .filter(Boolean)
      .map((c) => c.toLowerCase());
    result = result.filter((l) =>
      wanted.some((c) => String(l.L_City).toLowerCase().includes(c))
    );
  }
  if (filters.search) {
    const needle = filters.search.toLowerCase();
    result = result.filter((l) =>
      [l.L_AddressNumber, l.L_AddressStreet, fixtureListingId(l)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(needle)
    );
  }
  if (filters.listOfficeId) {
    result = result.filter((l) =>
      String(l.LO1_OrganizationName).toLowerCase().includes('copper dog')
    );
  }

  if (filters.sort === 'price_asc') {
    result.sort((a, b) => Number(a.L_AskingPrice) - Number(b.L_AskingPrice));
  } else if (filters.sort === 'price_desc') {
    result.sort((a, b) => Number(b.L_AskingPrice) - Number(a.L_AskingPrice));
  } else if (filters.sort === 'recent') {
    result.sort(
      (a, b) =>
        new Date(b.L_InputDate).getTime() - new Date(a.L_InputDate).getTime()
    );
  }

  return result.slice(0, filters.limit ?? 10);
}
