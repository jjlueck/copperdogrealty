"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import Image from "next/image"
import { Heart, MapPin, Bed, Bath, Square, Search, Filter, ChevronLeft, ChevronRight, Check, ChevronsUpDown, Map, LayoutGrid } from "lucide-react"
import Link from "next/link"
import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import cities from "@/app/constants/cities.json"
import { PropertyCard, Listing, getVal } from "@/components/property-card"
import { PropertyMap } from "@/components/property-map"
import { cn } from "@/lib/utils"

function PropertiesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [citySearch, setCitySearch] = useState("")
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')

  // Filter State
  const [filters, setFilters] = useState({
    city: "",
    minPrice: "",
    maxPrice: "",
    minBeds: "",
    minBaths: "",
    sort: "",
  })

  const selectedCityCodes = filters.city ? filters.city.split(',').filter(Boolean) : []
  const selectedCities = cities.filter(c => selectedCityCodes.includes(c.value))

  // Initialize filters from URL params on mount
  useEffect(() => {
    setFilters({
      city: searchParams.get("city") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      minBeds: searchParams.get("minBeds") || "",
      minBaths: searchParams.get("minBaths") || "",
      sort: searchParams.get("sort") || "",
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
      if (currentFilters.sort) params.append("sort", currentFilters.sort)
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
      sort: searchParams.get("sort") || "",
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
    if (filters.sort) params.set("sort", filters.sort)
    
    router.push(`/properties?${params.toString()}`)
  }

  return (
    <>
      {/* Hero / Filter Section */}
      <section className="bg-white border-b border-border sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4 items-end">
            
            {/* City */}
            <div className="w-full lg:w-48 space-y-2">
              <Label htmlFor="city" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">City</Label>
              <div className="relative">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="city"
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between font-normal truncate h-10"
                    >
                      {filters.city
                        ? selectedCities.map(c => c.label).join(", ")
                        : "Select cities..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0" align="start">
                    <div className="p-2">
                      <Input
                        placeholder="Search city..."
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                        className="h-8 text-sm"
                      />
                      <div className="max-h-[300px] overflow-y-auto mt-2">
                        {/* Selected Cities */}
                        {selectedCities.length > 0 && (
                          <div className="mb-2">
                            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Selected</div>
                            {selectedCities.map((city) => (
                              <div
                                key={city.value}
                                role="option"
                                onClick={() => {
                                  const newCities = selectedCityCodes.filter(c => c !== city.value)
                                  setFilters((prev) => ({
                                    ...prev,
                                    city: newCities.join(','),
                                  }))
                                }}
                                className="flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                              >
                                <Check className="mr-2 h-4 w-4 opacity-100" />
                                {city.label}
                              </div>
                            ))}
                            <div
                              role="option"
                              onClick={() => {
                                setFilters((prev) => ({ ...prev, city: "" }))
                                setOpen(false)
                              }}
                              className="flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-muted-foreground italic"
                            >
                              Clear all
                            </div>
                          </div>
                        )}

                        {/* Search Results */}
                        {citySearch.length > 0 && (
                          <div>
                            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Results</div>
                            {cities
                              .filter(city => 
                                !selectedCityCodes.includes(city.value) && 
                                city.label.toLowerCase().includes(citySearch.toLowerCase())
                              )
                              .slice(0, 10)
                              .map((city) => (
                                <div
                                  key={city.value}
                                  role="option"
                                  onClick={() => {
                                    const newCities = [...selectedCityCodes, city.value]
                                    setFilters((prev) => ({
                                      ...prev,
                                      city: newCities.join(','),
                                    }))
                                    setCitySearch("")
                                  }}
                                  className="flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                                >
                                  <Check className="mr-2 h-4 w-4 opacity-0" />
                                  {city.label}
                                </div>
                              ))}
                          </div>
                        )}

                        {citySearch.length > 0 && cities.filter(city => 
                                !selectedCityCodes.includes(city.value) && 
                                city.label.toLowerCase().includes(citySearch.toLowerCase())
                              ).length === 0 && (
                          <div className="py-6 text-center text-sm">No city found.</div>
                        )}

                        {citySearch.length === 0 && selectedCities.length === 0 && (
                           <div className="p-4 text-xs text-muted-foreground text-center">
                             Type to search cities...
                           </div>
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Price Range */}
            <div className="flex gap-2 w-full lg:w-64">
              <div className="space-y-2 w-1/2">
                <Label htmlFor="minPrice" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Min Price</Label>
                <Input 
                  id="minPrice" 
                  name="minPrice" 
                  type="number" 
                  placeholder="No Min" 
                  value={filters.minPrice}
                  onChange={handleInputChange}
                  className="h-10"
                />
              </div>
              <div className="space-y-2 w-1/2">
                <Label htmlFor="maxPrice" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Max Price</Label>
                <Input 
                  id="maxPrice" 
                  name="maxPrice" 
                  type="number" 
                  placeholder="No Max" 
                  value={filters.maxPrice}
                  onChange={handleInputChange}
                  className="h-10"
                />
              </div>
            </div>

            {/* Beds & Baths */}
            <div className="flex gap-2 w-full lg:w-48">
              <div className="space-y-2 w-1/2">
                <Label htmlFor="minBeds" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Beds</Label>
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
                <Label htmlFor="minBaths" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Baths</Label>
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

            {/* Sort By */}
            <div className="w-full lg:w-48 space-y-2">
              <Label htmlFor="sort" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sort By</Label>
              <div className="relative">
                <select 
                  id="sort" 
                  name="sort" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={filters.sort}
                  onChange={handleInputChange}
                >
                  <option value="">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full lg:w-auto flex flex-col lg:flex-row lg:items-center gap-4 pb-[1px]">
              <Button type="submit" className="w-full lg:w-auto h-10">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>

              <div className="flex items-center gap-3">
                <div className="flex border rounded-md overflow-hidden bg-background h-10">
                  <Button 
                    type="button"
                    variant={viewMode === 'list' ? 'default' : 'ghost'} 
                    size="icon" 
                    onClick={() => setViewMode('list')}
                    className="rounded-none border-r h-full w-10"
                    title="List View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button 
                    type="button"
                    variant={viewMode === 'map' ? 'default' : 'ghost'} 
                    size="icon" 
                    onClick={() => setViewMode('map')}
                    className="rounded-none h-full w-10"
                    title="Map View"
                  >
                    <Map className="w-4 h-4" />
                  </Button>
                </div>
                {viewMode === 'list' && (
                  <button 
                    type="button"
                    onClick={() => setViewMode('map')}
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
                  >
                    Show map view
                  </button>
                )}
              </div>
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
            viewMode === 'list' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {properties.map((property, index) => (
                  <PropertyCard key={getVal(property, ['ListingID', 'L_ListingID', 'L_DisplayId']) || index} property={property} index={index} />
                ))}
              </div>
            ) : (
              <div className="h-[70vh] w-full">
                <PropertyMap 
                  properties={properties} 
                  apiKey={process.env.GOOGLE_MAPS_API_KEY || ""} 
                />
              </div>
            )
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
