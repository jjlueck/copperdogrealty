import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { Mail, Phone } from "lucide-react"
import { Carousel } from "@/components/ui/carousel"

const teamMembers = [
  {
    id: 1,
    name: "Beth Toliver",
    role: "Owner | Broker, Copper Dog Realty, LLC",
    bio: `Beth Toliver is the Owner and Broker of <strong>Copper Dog Realty</strong>, a boutique real estate brokerage proudly serving the Iowa Great Lakes region. With a genuine passion for helping people find the right place to call home, Beth brings a personal, client-focused approach to every transaction. Her dedication to integrity, communication, and community is at the core of Copper Dog Realty’s mission.
          <br/>
          <br/>
          As a long-time resident of the Iowa Great Lakes area, Beth understands the unique character and charm that make this community special — from peaceful lakeside retreats to family homes and investment opportunities. She founded Copper Dog Realty to provide a professional yet welcoming real estate experience where every client feels valued and supported.
          <br/>
          <br/>
          When she’s not working with clients or leading her team, Beth enjoys spending time in nature with her family and her two dachshunds, Neville and Dobby Dean — the inspiration behind the Copper Dog name.`,
    email: "beth@copperdogrealty.com",
    phone: "(712) 330-4793",
    image: "/images/beth.png",
    specialties: ["Lakefront Properties", "First-Time Buyers", "Investment Properties"],
  },
  {
    id: 2,
    name: "Jason Grinnen",
    role: "REALTOR® | Copper Dog Realty, LLC",
    bio: `A Minnesota-born Okobojian, <strong>Jason Grinnen</strong> has proudly called the Iowa Great Lakes home since 2004. With over 20 years of real estate experience in the area, Jason brings unmatched expertise, local insight, and a genuine passion for helping clients achieve their real estate goals.
          <br/> 
          <br/>
          Whether you’re buying, selling, or investing, Jason provides exceptional service backed by a worldwide network, innovative marketing strategies, and cutting-edge technology — all designed to make your property stand out in today’s fast-paced market. His deep understanding of market trends and dedication to his clients have earned him a reputation for trust, professionalism, and results.
          <br/>
          <br/>
          When he’s not chasing your real estate dreams, Jason enjoys spending time with his husband, Brad, and their dog, Harper. Most mornings, you can find Jason and Harper at the Lakes Area Dog Park — their favorite way to start the day in beautiful Okoboji.`,
    email: "jason@copperdogrealty.com",
    phone: "(555) 123-4568",
    image: "/images/jason.jpg",
    specialties: ["Residential Sales", "Relocation Services", "Market Analysis"],
  },
  {
    id: 5,
    name: "Jessica Stafford",
    role: "REALTOR® | Copper Dog Realty, LLC",
    bio: `Jessica began her real estate career in 2015 and has been a multimillion-dollar producer since her very first year. At Copper Dog Realty, she brings that same drive, expertise, and heart to every client relationship. Jessica’s favorite part of being a REALTOR® is partnering with buyers and sellers to help turn their real estate dreams into reality. She believes every transaction is more than a deal—it’s a journey worth doing together.
          <br/>
          <br/>
          Known for her proactive communication, Jessica works tirelessly to keep clients informed and supported every step of the way. She anticipates challenges before they arise, creating a smooth and stress-free experience that sets her apart in a competitive market.
          <br/>
          <br/>
          For Jessica, there’s nothing more rewarding than handing over keys to a new home or delivering the final check at closing. Those moments are a reminder of why she loves what she does—helping people move confidently into their next chapter.
          <br/>
          <br/>
          <strong>Jessica is proud to be part of the Copper Dog Realty family, where real estate is rooted in relationships, integrity, and local community.</strong>`,
    email: "jessica@copperdogrealty.com",
    phone: "(555) 123-4568",
    image: "/images/jessica.jpg",
    specialties: ["Residential Sales", "Relocation Services", "Market Analysis"],
  },
  {
    id: 3,
    name: "Dobby Dean",
    role: "Chief Morale Officer | Copper Dog Realty Mascot",
    bio: `Meet Dobby Dean, one of Copper Dog Realty’s beloved dachshunds and our unofficial Chief Morale Officer. With his big personality and even bigger heart, Dobby keeps the office smiling and reminds us all to enjoy the little moments — whether it’s a sunny walk, a good nap, or greeting clients with a wagging tail.
          <br/> 
          <br/>
          Known for his curious nature and confident strut, Dobby Dean takes his role seriously (especially when treats are involved). He embodies the spirit of Copper Dog Realty — loyal, warm, and full of personality.
          <br/>
          <br/>
          When he’s not keeping an eye on things around the office, you’ll find Dobby exploring the outdoors with his family and his brother, Neville.`,
    email: "dobby.dean@copperdogrealty.com",
    phone: "(555) 123-4570",
    image: "/images/dogs/team-4.jpg",
    specialties: ["Eating", "Naps", "Cuddles"],
  },
  {
    id: 4,
    name: "Neville",
    role: "Head of Security | Copper Dog Realty Mascot",
    bio: `Meet <strong>Neville</strong>, Copper Dog Realty’s dignified dachshund and Head of Security. Calm, observant, and always on duty, Neville keeps a close watch on the office and makes sure everything — and everyone — is right where it should be. His loyal nature and steady presence make him the perfect counterpart to his brother, Dobby Dean.
          <br/> 
          <br/>
          While Neville takes his responsibilities seriously, he’s also known for his gentle side. He’s happiest when spending time with his family, enjoying quiet moments in nature, or basking in a sunny spot after a long day of “work.”
          <br/>
          <br/>
          Neville embodies the heart of Copper Dog Realty — loyal, dependable, and always ready to make you feel at home.`,
    email: "neville@copperdogrealty.com",
    phone: "(555) 123-4569",
    image: "/images/dogs/team-3.jpg",
    specialties: ["Being enthusiastc", "Looking adorable"],
  },
]

const dachshundImages = [
  "/images/dogs/dog-1.jpg",
  "/images/dogs/dog-2.jpg",
  "/images/dogs/dog-3.jpg",
  "/images/dogs/dog-4.jpg",
  "/images/dogs/dog-5.jpg",
  "/images/dogs/dog-6.jpg",
  "/images/dogs/dog-7.jpg",
  "/images/dogs/dog-8.jpg",
  "/images/dogs/dog-9.jpg",
  "/images/dogs/dog-10.jpg",
  "/images/dogs/dog-11.jpg",
  "/images/dogs/dog-12.jpg",
  "/images/dogs/dog-13.jpg",
  "/images/dogs/dog-14.jpg",
  "/images/dogs/dog-15.jpg",
  "/images/dogs/dog-16.jpg",
];

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
                (member.id === 3 || member.id === 4) ? (
                  <Card key={member.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6">
                      <div className="sm:col-span-1">
                        <div className="relative aspect-square rounded-lg overflow-hidden">
                          {/* Some funny math to pick 8 unique images for each dog team member */}
                          <Carousel images={dachshundImages.slice((member.id - 3) * 8, (member.id - 2) * 8)} width={300} height={300} />
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <h3 className="text-2xl font-bold text-foreground mb-1">{member.name}</h3>
                        <p className="text-primary font-medium mb-4">{member.role}</p>
                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: member.bio }} />
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
                ) : (
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

                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: member.bio }} />

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
                )
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
