import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">Our Story</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Where loyalty, warmth, and expertise come together to help you find home.
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">Why Copper Dog Realty?</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Copper Dog Realty was founded on a simple but powerful belief: finding a home should feel as joyful
                    and meaningful as welcoming a loyal companion into your life. Just as every dog has unique
                    personality and needs the right family, every home has its own character and deserves to be matched
                    with people who will truly appreciate it.
                  </p>
                  <p>
                    Our name comes from the beloved dachshund—a breed known for loyalty, determination, and an outsized
                    heart. These qualities define how we approach real estate: we're fiercely loyal to our clients,
                    determined to find the perfect match, and we put our whole hearts into every transaction.
                  </p>
                  <p>
                    Based in Milford, Iowa, we serve the beautiful Iowa Great Lakes region with a deep commitment to our
                    community. We're not just selling houses—we're helping families find where they belong, supporting
                    local businesses, and building stronger neighborhoods one home at a time.
                  </p>
                </div>
              </div>

              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/images/placeholders/about-story.jpg"
                  alt="Copper Dog Realty story"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Values Section */}
            <div className="bg-muted/30 rounded-2xl p-8 md:p-12">
              <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Our Values</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🏡</span>
                  </div>
                  <h3 className="font-semibold text-xl mb-3 text-foreground">Integrity First</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We believe in honest communication, transparent processes, and always putting our clients' best
                    interests first. No games, no pressure—just genuine guidance.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">❤️</span>
                  </div>
                  <h3 className="font-semibold text-xl mb-3 text-foreground">Community Heart</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We're deeply invested in the Iowa Great Lakes community. When our neighbors thrive, we all thrive.
                    We support local businesses and give back whenever we can.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🤝</span>
                  </div>
                  <h3 className="font-semibold text-xl mb-3 text-foreground">Personal Touch</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    You're not just a transaction to us—you're family. We take time to understand your unique needs and
                    provide personalized service every step of the way.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Let's Find Your Forever Home</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90 leading-relaxed">
              Whether you're buying your first home, upgrading for a growing family, or finding the perfect lakefront
              retreat, we're here to help make it happen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/contact">Get in Touch</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                asChild
              >
                <Link href="/properties">Browse Homes</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
