import type { Metadata } from "next"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import type { Listing } from "@/components/property-card"
import { getRetsClient } from "@/lib/rets-client"
import { PropertiesContent } from "./properties-content"

export const metadata: Metadata = {
  title: "Iowa Great Lakes Homes for Sale | Copper Dog Realty",
  description:
    "Browse current listings in Spirit Lake, Okoboji, Arnolds Park, Milford, Spencer and across the Iowa Great Lakes. Search by city, price, beds and baths.",
}

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const num = (v: string | undefined) => (v ? Number(v) : undefined)

/** Same filters the client sends to /api/properties, so the first render matches. */
async function loadListings(params: Record<string, string | undefined>) {
  try {
    const listings = await getRetsClient().searchProperties({
      city: params.city || undefined,
      search: params.search || undefined,
      minPrice: num(params.minPrice),
      maxPrice: num(params.maxPrice),
      minBeds: num(params.minBeds),
      minBaths: num(params.minBaths),
      sort: (params.sort || undefined) as "recent" | "price_asc" | "price_desc" | undefined,
      limit: 50,
    })
    return { listings: listings as Listing[], error: null }
  } catch (err: unknown) {
    console.error("[Properties] Failed to load listings:", err)
    return { listings: [], error: err instanceof Error ? err.message : "Failed to fetch properties" }
  }
}

export default async function PropertiesPage({ searchParams }: Props) {
  const raw = await searchParams
  const params = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
  )
  const { listings, error } = await loadListings(params)

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 pt-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground uppercase">Iowa Great Lakes Homes for Sale</h1>
          <p className="text-muted-foreground mt-1">
            Current listings across Spirit Lake, Okoboji, Arnolds Park, Milford, Spencer and the surrounding area.
          </p>
        </div>
        <PropertiesContent initialProperties={listings} initialError={error} />
      </main>
      <Footer />
    </div>
  )
}
