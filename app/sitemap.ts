import type { MetadataRoute } from "next"
import { getRetsClient } from "@/lib/rets-client"
import { COPPER_DOG_OFFICE_ID, COPPER_DOG_ORG_NAME_PREFIX } from "@/app/constants/brokerage"

const SITE_URL = "https://copperdogrealty.com"

// Rebuilt at most every 12 hours, matching the listing search cache.
export const revalidate = 43200

// /share-your-dog is left out on purpose: it is noindex.
const STATIC_PATHS = ["/", "/properties", "/about", "/team", "/contact", "/resources"]

/**
 * Only Copper Dog's own listings. Other brokerages' listings appear on many
 * IDX sites, and Google tends to skip those as duplicates.
 */
async function copperDogListingIds(): Promise<string[]> {
  try {
    const listings = await getRetsClient().searchProperties({
      listOfficeId: COPPER_DOG_OFFICE_ID,
      limit: 50,
    })
    return listings
      .filter((l) => (l.LO1_OrganizationName || "").startsWith(COPPER_DOG_ORG_NAME_PREFIX))
      .map((l) => l.L_ListingID || l.L_DisplayId || l.ListingID)
      .filter(Boolean)
  } catch (err) {
    // An MLS outage should shrink the sitemap, not break it.
    console.error("[Sitemap] Failed to fetch listings:", err)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const listingIds = await copperDogListingIds()
  return [
    ...STATIC_PATHS.map((p) => ({ url: `${SITE_URL}${p === "/" ? "" : p}` })),
    ...listingIds.map((id) => ({ url: `${SITE_URL}/properties/${id}` })),
  ]
}
