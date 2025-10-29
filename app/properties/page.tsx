import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Heart, MapPin, Bed, Bath, Square } from "lucide-react"

const properties = [
  {
    id: 1,
    name: "Sunny Lakefront Retreat",
    price: 425000,
    beds: 3,
    baths: 2,
    sqft: 1850,
    location: "West Okoboji Lake",
    status: "New Listing",
    description:
      "This cheerful home has been waiting patiently for the right family. With stunning lake views and a warm, welcoming interior, it's ready to create countless memories.",
    image: "/images/placeholders/property-1.jpg",
  },
  {
    id: 2,
    name: "Cozy Downtown Charmer",
    price: 285000,
    beds: 2,
    baths: 1.5,
    sqft: 1200,
    location: "Downtown Milford",
    status: "Available",
    description:
      "A loyal companion of a home in the heart of Milford. This sweet property is eager to welcome a family who will appreciate its character and charm.",
    image: "/images/placeholders/property-2.jpg",
  },
  {
    id: 3,
    name: "Spacious Family Haven",
    price: 565000,
    beds: 4,
    baths: 3,
    sqft: 2800,
    location: "Spirit Lake",
    status: "New Listing",
    description:
      "Like a gentle giant, this home has plenty of room for a growing family. Patient and dependable, it's been waiting for the perfect match.",
    image: "/images/placeholders/property-3.jpg",
  },
  {
    id: 4,
    name: "Modern Waterfront Gem",
    price: 725000,
    beds: 3,
    baths: 2.5,
    sqft: 2200,
    location: "East Okoboji Lake",
    status: "Available",
    description:
      "Sleek and sophisticated, this home is ready to impress. With modern amenities and breathtaking views, it's the perfect forever home.",
    image: "/images/placeholders/property-4.jpg",
  },
  {
    id: 5,
    name: "Rustic Countryside Estate",
    price: 395000,
    beds: 3,
    baths: 2,
    sqft: 2100,
    location: "Rural Milford",
    status: "Available",
    description:
      "This home loves the outdoors! Set on spacious grounds, it's perfect for families who enjoy nature and wide-open spaces.",
    image: "/images/placeholders/property-5.jpg",
  },
  {
    id: 6,
    name: "Elegant Victorian Beauty",
    price: 485000,
    beds: 4,
    baths: 2.5,
    sqft: 2400,
    location: "Historic Milford",
    status: "Available",
    description:
      "A distinguished home with timeless appeal. This property has been lovingly maintained and is ready to continue its legacy with a new family.",
    image: "/images/placeholders/property-6.jpg",
  },
]

export default function PropertiesPage() {
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
              {properties.map((property) => (
                <Card key={property.id} className="overflow-hidden hover:shadow-xl transition-all group">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={property.image || "/placeholder.svg"}
                      alt={property.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                      <Badge className="bg-primary text-primary-foreground">{property.status}</Badge>
                      <button className="w-10 h-10 bg-background/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-background transition-colors">
                        <Heart className="w-5 h-5 text-foreground" />
                      </button>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-xl text-foreground">{property.name}</h3>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{property.location}</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 pb-4 border-b border-border">
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        <span>{property.beds} bed</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="w-4 h-4" />
                        <span>{property.baths} bath</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Square className="w-4 h-4" />
                        <span>{property.sqft.toLocaleString()} sq ft</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-3">
                      {property.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">${property.price.toLocaleString()}</span>
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
            <Button size="lg">Contact Our Team</Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
