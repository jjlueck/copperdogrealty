import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { Home, Heart, Users, MapPin } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
                  Every Home Deserves a Loving Family
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                  Welcome to Copper Dog Realty, where we believe finding your perfect home should feel as joyful as
                  adopting a loyal companion. Serving the Iowa Great Lakes with integrity, warmth, and personalized
                  service.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" asChild>
                    <Link href="/properties">Browse Available Homes</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/team">Meet Our Team</Link>
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/images/placeholders/hero-home.jpg"
                    alt="Beautiful lakefront home in Iowa Great Lakes"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose Copper Dog Realty?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                We bring small-town warmth and big-time expertise to every transaction
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-2 hover:border-primary transition-colors">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Personalized Service</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Every client gets our full attention and dedication, just like family
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary transition-colors">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Local Expertise</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Deep knowledge of Milford and the Iowa Great Lakes region
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary transition-colors">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Community Focused</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We're invested in building strong, thriving neighborhoods
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary transition-colors">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Home className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">Trusted Guidance</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Honest advice and support through every step of your journey
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Featured Properties Preview */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Homes Waiting for Their Forever Families
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Just like rescue dogs, these wonderful homes are ready to bring joy to the right family
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={`/images/placeholders/property-${i}.jpg`}
                      alt={`Property ${i}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                      New Listing
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-xl mb-2 text-foreground">Charming Lakefront Home</h3>
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">3 bed • 2 bath • 1,850 sq ft</p>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      This lovely home has been patiently waiting for a family to fill it with laughter and memories...
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">$425,000</span>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button size="lg" asChild>
                <Link href="/properties">View All Available Homes</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Ready to Find Your Perfect Home?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90 leading-relaxed">
              Let's start your journey together. Our team is here to help you every step of the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/contact">Schedule a Consultation</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                asChild
              >
                <Link href="/properties">Browse Listings</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
