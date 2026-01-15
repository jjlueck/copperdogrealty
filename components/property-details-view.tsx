"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import Link from "next/link"
import { 
  MapPin, Bed, Bath, Square, Calendar, 
  Home, Info, ChevronLeft, ChevronRight
} from "lucide-react"
import { ListingDetail } from "@/types/listing"

interface PropertyDetailsViewProps {
  listing: ListingDetail
}

export function PropertyDetailsView({ listing }: PropertyDetailsViewProps) {
  const router = useRouter();
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  const nextPhoto = () => {
    if (!listing?.photos) return;
    setActivePhotoIndex((prev) => (prev + 1) % listing.photos!.length);
  };

  const prevPhoto = () => {
    if (!listing?.photos) return;
    setActivePhotoIndex((prev) => (prev - 1 + listing.photos!.length) % listing.photos!.length);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/properties');
    }
  };

  // Helpers
  const getVal = (val?: string) => val || "N/A";
  const formatPrice = (price?: string) => price ? `$${Number(price).toLocaleString()}` : "Price Upon Request";
  const address = `${listing.L_AddressNumber || ""} ${listing.L_AddressStreet || ""}`.trim() || listing.L_Address || "Address Unavailable";
  const cityStateZip = `${listing.L_City || ""}, ${listing.L_State || ""} ${listing.L_Zip || ""}`.trim();

  const features = [
    { label: "Year Built", value: listing.LM_Int2_13, icon: Calendar },
    { label: "Style", value: listing.LFD_ArchitecturalStyle_5002, icon: Home },
    { label: "Construction", value: listing.LFD_ConstructionMaterials_5013, icon: Home },
    { label: "Levels", value: listing.LFD_Levels_5030, icon: Home },
    { label: "Garage", value: listing.LFD_GarageType_5022, icon: Home },
    { label: "Heating", value: listing.LFD_Heating_5027, icon: Info },
    { label: "Water", value: listing.LFD_WaterSource_5043, icon: Info },
    { label: "Sewer", value: listing.LFD_Sewer_5040, icon: Info },
  ].filter(f => f.value && f.value !== "Other" && f.value !== "None");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 pb-16">
        {/* Navigation Bar */}
        <div className="bg-white border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Listings
            </Button>
          </div>
        </div>

        {/* Gallery Hero */}
        <section className="bg-black relative h-[50vh] md:h-[60vh] lg:h-[70vh]">
          {listing.photos && listing.photos.length > 0 ? (
            <>
              <Image 
                src={listing.photos[activePhotoIndex]} 
                alt={`Photo ${activePhotoIndex + 1}`}
                fill
                className="object-contain"
                priority
              />
              <div className="absolute inset-0 flex items-center justify-between px-4 w-full mx-auto md:max-w-4xl lg:max-w-5xl pointer-events-none">
                <Button variant="ghost" onClick={prevPhoto} className="bg-black/30 md:bg-transparent hover:bg-black/60 text-white rounded-full w-10 h-10 md:w-40 md:h-40 flex items-center justify-center p-0 pointer-events-auto transition-colors">
                  <ChevronLeft className="w-6 h-6 md:w-32 md:h-32" />
                </Button>
                <Button variant="ghost" onClick={nextPhoto} className="bg-black/30 md:bg-transparent hover:bg-black/60 text-white rounded-full w-10 h-10 md:w-40 md:h-40 flex items-center justify-center p-0 pointer-events-auto transition-colors">
                  <ChevronRight className="w-6 h-6 md:w-32 md:h-32" />
                </Button>
              </div>
              <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                {activePhotoIndex + 1} / {listing.photos.length}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-white/50">No Images Available</div>
          )}
        </section>

        <div className="container mx-auto px-4 -mt-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Header Card */}
              <Card className="shadow-lg border-0 overflow-hidden">
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                      <h1 className="text-3xl font-bold text-foreground mb-2">{address}</h1>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{cityStateZip}</span>
                      </div>
                    </div>
                    <div className="text-left md:text-right">
                      <div className="text-3xl font-bold text-primary mb-1">
                        {formatPrice(listing.L_AskingPrice)}
                      </div>
                      <Badge variant="outline" className="text-sm px-3 py-1">
                        {listing.L_Status || "Active"}
                      </Badge>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col items-center justify-center p-3 bg-muted/30 rounded-lg">
                      <Bed className="w-6 h-6 text-primary mb-2" />
                      <span className="text-2xl font-bold">{getVal(listing.LM_Int1_11)}</span>
                      <span className="text-xs uppercase text-muted-foreground font-semibold">Beds</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 bg-muted/30 rounded-lg">
                      <Bath className="w-6 h-6 text-primary mb-2" />
                      <span className="text-2xl font-bold">{getVal(listing.LM_Dec_35)}</span>
                      <span className="text-xs uppercase text-muted-foreground font-semibold">Baths</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 bg-muted/30 rounded-lg">
                      <Square className="w-6 h-6 text-primary mb-2" />
                      <span className="text-2xl font-bold">
                        {listing.LM_Int2_4 ? Number(listing.LM_Int2_4).toLocaleString() : "N/A"}
                      </span>
                      <span className="text-xs uppercase text-muted-foreground font-semibold">Sq Ft</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card className="shadow-sm border-border/60">
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-xl font-bold mb-4">About This Home</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {listing.LR_remarks3636 || "No description available."}
                  </p>
                  {listing.LR_remarks5050 && (
                    <p className="text-muted-foreground leading-relaxed mt-4 italic text-sm border-t pt-4">
                      {listing.LR_remarks5050}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Features */}
              {features.length > 0 && (
                <Card className="shadow-sm border-border/60">
                  <CardContent className="p-6 md:p-8">
                    <h2 className="text-xl font-bold mb-6">Property Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                          <feature.icon className="w-5 h-5 text-primary/70" />
                          <div>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">{feature.label}</p>
                            <p className="font-medium">{feature.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>

            {/* Sidebar / Contact */}
            <div className="space-y-6">
              <Card className="shadow-lg border-0 sticky top-24">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">Contact Agent</h3>
                  <Button className="w-full mb-3" size="lg" asChild>
                    <Link href={`/contact?listingId=${listing.L_ListingID}&address=${encodeURIComponent(address)}`}>Schedule a Showing</Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/contact?listingId=${listing.L_ListingID}&address=${encodeURIComponent(address)}`}>Ask a Question</Link>
                  </Button>
                  <div className="mt-8 pt-6 border-t border-border text-xs text-muted-foreground">
                    <p className="font-semibold mb-1">Listing Provided By:</p>
                    <p>{listing.LO1_OrganizationName}</p>
                    <p>{listing.L_AttributionContact}</p>
                    <p className="mt-2 opacity-70">
                      Information is deemed reliable but not guaranteed.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
