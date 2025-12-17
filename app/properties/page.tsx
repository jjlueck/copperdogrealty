"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { Heart, MapPin, Bed, Bath, Square, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import cities from "@/app/constants/cities.json"

// Define a type for the listing based on our RETS knowledge
interface Listing {
  ListingID?: string;
  L_ListingID?: string;
  L_DisplayId?: string;
  
  // Address
  StreetNumber?: string;
  L_AddressNumber?: string;
  StreetName?: string;
  L_AddressStreet?: string;
  City?: string;
  L_City?: string;
  
  // Price
  ListPrice?: string;
  L_AskingPrice?: string;
  
  // Specs
  BedroomsTotal?: string;
  LM_Int1_11?: string; // Beds
  
  BathroomsTotalInteger?: string;
  LM_Dec_35?: string; // Baths
  
  LivingArea?: string;
  LM_Int2_4?: string; // SqFt
  
  // Details
  PublicRemarks?: string;
  LR_remarks3636?: string;
  L_Remarks?: string;
  
  // Status
  MlsStatus?: string;
  L_Status?: string;
  
  photos?: string[];
}

// Helper to safely get values
const getVal = (item: Listing, keys: (keyof Listing)[]) => {
  for (const k of keys) {
    if (item[k] !== undefined && item[k] !== null && item[k] !== "") return item[k];
  }
  return undefined;
};

// Extracted Property Card Component
function PropertyCard({ property, index }: { property: Listing, index: number }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const photos = property.photos || [];
  const hasMultiplePhotos = photos.length > 1;

  const nextPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const id = getVal(property, ['ListingID', 'L_ListingID', 'L_DisplayId']) || index;
  const price = getVal(property, ['ListPrice', 'L_AskingPrice']);
  const streetNum = getVal(property, ['StreetNumber', 'L_AddressNumber']) || "";
  const streetName = getVal(property, ['StreetName', 'L_AddressStreet']) || "";
  const city = getVal(property, ['City', 'L_City']);
  const beds = getVal(property, ['BedroomsTotal', 'LM_Int1_11']);
  const baths = getVal(property, ['BathroomsTotalInteger', 'LM_Dec_35']);
  const sqft = getVal(property, ['LivingArea', 'LM_Int2_4']);
  const status = getVal(property, ['MlsStatus', 'L_Status']) || "Active";
  const remarks = getVal(property, ['PublicRemarks', 'LR_remarks3636', 'L_Remarks']);
  
  const displayImage = photos.length > 0 ? photos[currentImageIndex] : null;

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all group border-0 shadow-md flex flex-col h-full">
      <div className="relative aspect-[4/3] bg-muted group/image">
        {displayImage ? (
          <Image
            src={displayImage}
            alt={`${streetNum} ${streetName}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 bg-secondary/30">
            <span className="text-sm font-medium">No Image</span>
          </div>
        )}

        {/* Carousel Controls */}
        {hasMultiplePhotos && (
          <>
            <button 
              onClick={prevPhoto}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white rounded-full p-1 opacity-0 group-hover/image:opacity-100 transition-opacity z-20"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextPhoto}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white rounded-full p-1 opacity-0 group-hover/image:opacity-100 transition-opacity z-20"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full opacity-0 group-hover/image:opacity-100 transition-opacity z-10">
              {currentImageIndex + 1}/{photos.length}
            </div>
          </>
        )}

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
          <Badge className="bg-white/95 text-foreground hover:bg-white shadow-sm backdrop-blur-sm border-0 font-medium pointer-events-auto">
            {status}
          </Badge>
        </div>
        
        {/* Gradient Overlay for Price */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12 pointer-events-none">
          <p className="text-white font-bold text-xl drop-shadow-md">
            {price ? `$${Number(price).toLocaleString()}` : "Price Upon Request"}
          </p>
        </div>
      </div>

      <CardContent className="p-4 flex flex-col flex-1">
        <div className="mb-3">
          <h3 className="font-semibold text-lg text-foreground line-clamp-1" title={`${streetNum} ${streetName}`}>
            {streetNum} {streetName}
            {!streetNum && !streetName && "Address Unavailable"}
          </h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{city || "City Unavailable"}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-border/50 text-sm mb-3">
          <div className="flex flex-col items-center justify-center p-1">
            <div className="flex items-center gap-1 font-semibold text-foreground">
              <Bed className="w-4 h-4 text-primary" />
              <span>{beds || "-"}</span>
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Beds</span>
          </div>
          <div className="flex flex-col items-center justify-center p-1 border-l border-border/50">
            <div className="flex items-center gap-1 font-semibold text-foreground">
              <Bath className="w-4 h-4 text-primary" />
              <span>{baths || "-"}</span>
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Baths</span>
          </div>
          <div className="flex flex-col items-center justify-center p-1 border-l border-border/50">
            <div className="flex items-center gap-1 font-semibold text-foreground">
              <Square className="w-4 h-4 text-primary" />
              <span>{sqft ? Number(sqft).toLocaleString() : "-"}</span>
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Sq Ft</span>
          </div>
        </div>

        {remarks && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-1">
            {remarks}
          </p>
        )}

        <Button variant="outline" size="sm" className="w-full mt-auto" asChild>
          <Link href={`/properties/${id}`}>View Details</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function PropertiesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter State
  const [filters, setFilters] = useState({
    city: "",
    minPrice: "",
    maxPrice: "",
    minBeds: "",
    minBaths: "",
  })

  // Initialize filters from URL params on mount
  useEffect(() => {
    setFilters({
      city: searchParams.get("city") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      minBeds: searchParams.get("minBeds") || "",
      minBaths: searchParams.get("minBaths") || "",
    })
  }, [searchParams])

  const fetchProperties = async (currentFilters: typeof filters) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (currentFilters.city) params.append("city", currentFilters.city)
      if (currentFilters.minPrice) params.append("minPrice", currentFilters.minPrice)
      if (currentFilters.maxPrice) params.append("maxPrice", currentFilters.maxPrice)
      if (currentFilters.minBeds) params.append("minBeds", currentFilters.minBeds)
      if (currentFilters.minBaths) params.append("minBaths", currentFilters.minBaths)
      params.append("limit", "50")

      const response = await fetch(`/api/properties?${params.toString()}`)
      if (!response.ok) {
        throw new Error("Failed to fetch properties")
      }
      const data = await response.json()
      setProperties(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch when searchParams change
  useEffect(() => {
    const currentFilters = {
      city: searchParams.get("city") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      minBeds: searchParams.get("minBeds") || "",
      minBaths: searchParams.get("minBaths") || "",
    }
    fetchProperties(currentFilters)
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Update URL params
    const params = new URLSearchParams()
    if (filters.city) params.set("city", filters.city)
    if (filters.minPrice) params.set("minPrice", filters.minPrice)
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice)
    if (filters.minBeds) params.set("minBeds", filters.minBeds)
    if (filters.minBaths) params.set("minBaths", filters.minBaths)
    
    router.push(`/properties?${params.toString()}`)
  }

  return (
    <>
      {/* Hero / Filter Section */}
      <section className="bg-white border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4 items-end">
            
            {/* City */}
            <div className="w-full lg:w-48 space-y-2">
              <Label htmlFor="city" className="text-xs font-semibold text-muted-foreground uppercase">City</Label>
              <div className="relative">
                <select 
                  id="city" 
                  name="city" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={filters.city}
                  onChange={handleInputChange}
                >
                  <option value="">Any City</option>
                  {cities.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price Range */}
            <div className="flex gap-2 w-full lg:w-64">
              <div className="space-y-2 w-1/2">
                <Label htmlFor="minPrice" className="text-xs font-semibold text-muted-foreground uppercase">Min Price</Label>
                <Input 
                  id="minPrice" 
                  name="minPrice" 
                  type="number" 
                  placeholder="No Min" 
                  value={filters.minPrice}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2 w-1/2">
                <Label htmlFor="maxPrice" className="text-xs font-semibold text-muted-foreground uppercase">Max Price</Label>
                <Input 
                  id="maxPrice" 
                  name="maxPrice" 
                  type="number" 
                  placeholder="No Max" 
                  value={filters.maxPrice}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Beds & Baths */}
            <div className="flex gap-2 w-full lg:w-48">
              <div className="space-y-2 w-1/2">
                <Label htmlFor="minBeds" className="text-xs font-semibold text-muted-foreground uppercase">Beds</Label>
                <select 
                  id="minBeds" 
                  name="minBeds"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={filters.minBeds}
                  onChange={handleInputChange}
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
              </div>
              <div className="space-y-2 w-1/2">
                <Label htmlFor="minBaths" className="text-xs font-semibold text-muted-foreground uppercase">Baths</Label>
                <select 
                  id="minBaths" 
                  name="minBaths"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={filters.minBaths}
                  onChange={handleInputChange}
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full lg:w-auto flex gap-2 pb-[1px]">
              <Button type="submit" className="w-full lg:w-auto">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
               <p>Fetching latest listings...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-20 text-red-500 bg-red-50 rounded-lg border border-red-100 p-8">
              <p className="font-semibold">Unable to load properties.</p>
              <p className="text-sm mt-2">{error}</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          )}

          {!loading && !error && properties.length === 0 && (
            <div className="text-center py-20 text-muted-foreground bg-white rounded-lg border border-border p-8 shadow-sm">
              <Filter className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No properties found.</p>
              <p className="text-sm mt-1">Try adjusting your filters to see more results.</p>
              <Button variant="link" onClick={() => {
                setFilters({city: "", minPrice: "", maxPrice: "", minBeds: "", minBaths: ""});
                router.push('/properties');
              }} className="mt-2">
                Clear all filters
              </Button>
            </div>
          )}

          {!loading && !error && properties.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {properties.map((property, index) => (
                <PropertyCard key={getVal(property, ['ListingID', 'L_ListingID', 'L_DisplayId']) || index} property={property} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default function PropertiesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
             <p>Loading properties...</p>
          </div>
        }>
          <PropertiesContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}