import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import utilitiesData from "@/app/constants/utilities.json"
import { cityToSlug, parseProviderItem } from "@/lib/utilities"
import { Download } from "lucide-react"
import Link from "next/link"

const cities = utilitiesData as { city: string; providers: { category: string; items: string[] }[] }[]

function ProviderItem({ item }: { item: string }) {
  const parsed = parseProviderItem(item)
  return (
    <span className="text-sm text-muted-foreground">
      {parsed.url && parsed.providerName ? (
        <>
          <a
            href={parsed.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {parsed.providerName}
          </a>
          {parsed.rest}
        </>
      ) : (
        parsed.rest || item
      )}
    </span>
  )
}

export default function ResourcesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 pt-16 pb-4">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
                Utility Providers
              </h1>
            </div>
          </div>
        </section>

        {/* Download All Section */}
        <section className="pt-4 pb-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Button asChild size="lg">
                <Link href="/resources/utilities-all-cities.pdf" download>
                  <Download className="w-4 h-4 mr-2" />
                  Download All Cities
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* City Cards */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cities.map((cityData) => {
                const slug = cityToSlug(cityData.city)
                return (
                  <Card key={cityData.city} className="flex flex-col">
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                      <CardTitle className="text-xl">{cityData.city}</CardTitle>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/resources/utilities-${slug}.pdf`} download>
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Link>
                      </Button>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <ul className="space-y-3">
                        {cityData.providers.map((provider) => (
                          <li key={provider.category}>
                            <span className="font-semibold text-foreground text-sm">
                              {provider.category}:
                            </span>{" "}
                            <ul className="mt-1 space-y-1 ml-2">
                              {provider.items.map((item, i) => (
                                <li key={i}>
                                  <ProviderItem item={item} />
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              Need Help Finding the Right Home?
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90 leading-relaxed">
              Our team knows the Iowa Great Lakes region inside and out. Reach out for personalized guidance on
              properties and local utilities.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/contact">Get in Touch</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
