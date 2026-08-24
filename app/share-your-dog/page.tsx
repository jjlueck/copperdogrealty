import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DogPhotoForm } from "@/components/dog-photo-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bone, Camera, Trophy } from "lucide-react"

export const metadata: Metadata = {
  title: "Treat. Snap. Share. | Copper Dog Realty",
  description:
    "Share a photo of your dog from the Good Dog Library outside Copper Dog Realty in Spirit Lake, Iowa.",
  openGraph: {
    title: "Treat. Snap. Share. | Copper Dog Realty",
    description:
      "Share a photo of your dog from the Good Dog Library outside Copper Dog Realty in Spirit Lake, Iowa.",
    images: "/images/little-free-library.jpg",
  },
  // Reachable by QR code, not by search. Also keeps a public upload form out of
  // the index.
  robots: { index: false, follow: false },
}

export default function ShareYourDogPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
                Treat. Snap. Share.
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                You found the Good Dog Library. Help yourself to a treat, then send us a photo of
                the dog who earned it.
              </p>
            </div>
          </div>
        </section>

        {/* Recognition Section: proves the page belongs to the box they're standing at */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/images/little-free-library.jpg"
                  alt="The Good Dog Library, a small wooden treat box with a Copper Dog Realty sign, outside the office in Spirit Lake, Iowa"
                  fill
                  priority
                  className="object-cover"
                />
              </div>

              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  Yes, you&apos;re in the right place
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    This is the little box you&apos;re standing in front of. &ldquo;Welcome to the
                    Good Dog Library. Take a stick, leave a stick.&rdquo; It sits outside our office
                    at 1715 Hill Ave, Suite 1, in Spirit Lake.
                  </p>
                  <p>
                    The treats inside are free, for dogs and for people. No catch, nothing to sign
                    up for. We keep it stocked because we like seeing who walks by.
                  </p>
                  <p>
                    This page is run by Copper Dog Realty, the same folks whose name is on the sign.
                    Photos you share come straight to our office inbox.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dog of the Month */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
                Dog of the Month
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Every photo shared is entered. Each month we pick a favorite, and there&apos;s a
                prize waiting at the office.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bone className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Treat</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Open the library and help yourself. There are biscuits for the dog and something
                  for you too.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Snap</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Any photo of your dog works. Mid-treat, mid-nap, mid-zoomies. We are not picky.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Share</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Send it with the form below. Leave your email or phone number and we&apos;ll tell
                  you if your dog is picked.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Upload Form */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-xl mx-auto">
              <Card>
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Share your dog</h2>
                  <DogPhotoForm />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              While You&apos;re Here
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90 leading-relaxed">
              We&apos;re a boutique brokerage serving the Iowa Great Lakes. If you&apos;re curious
              what&apos;s on the market, or just want to say hello, we&apos;d love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/properties">Browse Homes</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                asChild
              >
                <Link href="/contact">Get in Touch</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
