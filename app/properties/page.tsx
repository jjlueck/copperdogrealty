"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Heart, MapPin, Bed, Bath, Square } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch("/api/properties")
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

    fetchProperties()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading properties...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Error: {error}</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
                Homes Waiting for Their Forever Families
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Each of these wonderful properties is ready to welcome the right family. Browse our available homes and
                find your perfect match in the Iowa Great Lakes region.
              </p>
            </div>
          </div>
        </section>

        {/* Properties Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property, index) => (
                <Card key={property.ListingKey || property.ListingID || index} className="overflow-hidden hover:shadow-xl transition-all group">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={
                        property.photos && property.photos.length > 0
                          ? property.photos[0]
                          : `/images/placeholders/property-${(index % 6) + 1}.jpg`
                      }
                      alt={property.StreetName || property.L_AddressStreet || "Property Image"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                      <Badge className="bg-primary text-primary-foreground">{property.MlsStatus || property.L_Status || "Active"}</Badge>
                      <button className="w-10 h-10 bg-background/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-background transition-colors">
                        <Heart className="w-5 h-5 text-foreground" />
                      </button>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-xl text-foreground">
                        {property.StreetNumber || property.L_AddressNumber} {property.StreetName || property.L_AddressStreet} {property.StreetSuffix || ""}
                        {!property.StreetNumber && !property.StreetName && (property.L_Address || "Address Unavailable")}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{property.City || property.L_City}</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 pb-4 border-b border-border">
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        <span>{property.BedroomsTotal || property.Beds || "?"} bed</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="w-4 h-4" />
                        <span>{property.BathroomsTotalInteger || property.Baths || "?"} bath</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Square className="w-4 h-4" />
                        <span>{property.LivingArea ? Number(property.LivingArea).toLocaleString() : property.SqFt || "?"} sq ft</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-3">
                      {property.PublicRemarks || property.L_Remarks || "No remarks available."}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        {(property.ListPrice || property.L_AskingPrice)
                          ? `$${Number(property.ListPrice || property.L_AskingPrice).toLocaleString()}`
                          : "Price upon request"}
                      </span>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Don't See What You're Looking For?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              We're constantly adding new listings and have access to properties not yet on the market. Let us help you
              find your perfect home.
            </p>
            <Button size="lg" asChild>
              <Link href="/team">Contact Our Team</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}