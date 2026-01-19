import { getRetsClient } from "@/lib/rets-client"
import { PropertyDetailsView } from "@/components/property-details-view"
import { Metadata, ResolvingMetadata } from "next"
import { notFound } from "next/navigation"
import { ListingDetail } from "@/types/listing"

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params
  
  // Fetch data
  const client = getRetsClient();
  const listing = await client.getListingDetails(id) as ListingDetail | null;
 
  if (!listing) {
    return {
      title: 'Property Not Found',
    }
  }

  const address = `${listing.L_AddressNumber || ""} ${listing.L_AddressStreet || ""}`.trim() || listing.L_Address || "Property Details";
  const description = listing.LR_remarks3636 ? listing.LR_remarks3636.substring(0, 160) : `View details for ${address}.`;
  
  // Use the first photo or fall back to default
  const previousImages = (await parent).openGraph?.images || []
  const propertyImage = listing.photos && listing.photos.length > 0 
    ? listing.photos[0] 
    : undefined

  const images = propertyImage ? [propertyImage] : previousImages;

  return {
    title: `${address} | Copper Dog Realty`,
    description: description,
    openGraph: {
      title: `${address} | Copper Dog Realty`,
      description: description,
      images: images,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${address} | Copper Dog Realty`,
      description: description,
      images: images,
    }
  }
}

export default async function Page({ params }: Props) {
  const { id } = await params
  const client = getRetsClient();
  const listing = await client.getListingDetails(id) as ListingDetail | null;

  if (!listing) {
    notFound();
  }

  return <PropertyDetailsView listing={listing} />
}