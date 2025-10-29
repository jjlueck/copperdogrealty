import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, Phone, MapPin } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
                Let's Start Your Journey Home
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Have questions? Ready to start looking? Just want to chat about the market? We're here and happy to
                help. Reach out today.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="p-6 md:p-8">
                    <h2 className="text-2xl font-bold text-foreground mb-6">Send Us a Message</h2>

                    <form className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input id="firstName" placeholder="John" />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input id="lastName" placeholder="Doe" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="john@example.com" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" placeholder="(555) 123-4567" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="interest">I'm Interested In</Label>
                        <select
                          id="interest"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          <option value="">Select an option</option>
                          <option value="buying">Buying a Home</option>
                          <option value="selling">Selling a Home</option>
                          <option value="both">Both Buying and Selling</option>
                          <option value="commercial">Commercial Property</option>
                          <option value="consultation">General Consultation</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea id="message" placeholder="Tell us about what you're looking for..." rows={6} />
                      </div>

                      <Button type="submit" size="lg" className="w-full">
                        Send Message
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Info */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4 text-foreground">Contact Information</h3>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Phone className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Phone</p>
                          <a
                            href="tel:+15551234567"
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            (555) 123-4567
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <Mail className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Email</p>
                          <a
                            href="mailto:info@copperdogrealty.com"
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            info@copperdogrealty.com
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Location</p>
                          <p className="text-sm text-muted-foreground">
                            Milford, Iowa
                            <br />
                            Iowa Great Lakes Region
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-primary text-primary-foreground">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-2">Office Hours</h3>
                    <div className="space-y-1 text-sm opacity-90">
                      <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                      <p>Saturday: 10:00 AM - 4:00 PM</p>
                      <p>Sunday: By Appointment</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
