import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { Mail, Phone } from "lucide-react"

const teamMembers = [
  {
    id: 1,
    name: "Sarah Mitchell",
    role: "Founder & Lead Broker",
    bio: "With 15 years of experience in the Iowa Great Lakes region, Sarah founded Copper Dog Realty to bring a more personal, community-focused approach to real estate. She believes every home has a story and every family deserves to find their perfect match.",
    email: "sarah@copperdogrealty.com",
    phone: "(555) 123-4567",
    image: "/images/placeholders/team-1.jpg",
    specialties: ["Lakefront Properties", "First-Time Buyers", "Investment Properties"],
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Senior Real Estate Agent",
    bio: "Michael's attention to detail and patient guidance have helped countless families navigate the home buying process. He treats every client like family and believes in building lasting relationships beyond the sale.",
    email: "michael@copperdogrealty.com",
    phone: "(555) 123-4568",
    image: "/images/placeholders/team-2.jpg",
    specialties: ["Residential Sales", "Relocation Services", "Market Analysis"],
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Real Estate Agent",
    bio: "Emily's enthusiasm and local knowledge make her an invaluable resource for anyone looking to call the Iowa Great Lakes home. She's passionate about matching families with properties that truly fit their lifestyle.",
    email: "emily@copperdogrealty.com",
    phone: "(555) 123-4569",
    image: "/images/placeholders/team-3.jpg",
    specialties: ["Family Homes", "New Construction", "Neighborhood Expert"],
  },
  {
    id: 4,
    name: "David Thompson",
    role: "Commercial Real Estate Specialist",
    bio: "David brings expertise in commercial properties and investment opportunities. His strategic approach and market insights help businesses find the perfect location to grow and thrive.",
    email: "david@copperdogrealty.com",
    phone: "(555) 123-4570",
    image: "/images/placeholders/team-4.jpg",
    specialties: ["Commercial Sales", "Business Properties", "Investment Analysis"],
  },
]

export default function TeamPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">Meet Our Pack</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our team of dedicated real estate professionals is here to guide you home. With deep local knowledge and
                a commitment to personalized service, we're ready to help you find your perfect match.
              </p>
            </div>
          </div>
        </section>

        {/* Team Members */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {teamMembers.map((member) => (
                <Card key={member.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6">
                    <div className="sm:col-span-1">
                      <div className="relative aspect-square rounded-lg overflow-hidden">
                        <Image
                          src={member.image || "/placeholder.svg"}
                          alt={member.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <h3 className="text-2xl font-bold text-foreground mb-1">{member.name}</h3>
                      <p className="text-primary font-medium mb-4">{member.role}</p>

                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{member.bio}</p>

                      <div className="mb-4">
                        <p className="text-xs font-semibold text-foreground mb-2">Specialties:</p>
                        <div className="flex flex-wrap gap-2">
                          {member.specialties.map((specialty, index) => (
                            <span
                              key={index}
                              className="text-xs bg-secondary text-secondary-foreground px-3 py-1 rounded-full"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <a
                          href={`mailto:${member.email}`}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                          {member.email}
                        </a>
                        <a
                          href={`tel:${member.phone}`}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                          {member.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Ready to Work With Us?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90 leading-relaxed">
              Our team is here to answer your questions and help you navigate your real estate journey. Reach out today
              to get started.
            </p>
            <Button size="lg" variant="secondary">
              Schedule a Consultation
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
