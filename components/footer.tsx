import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-muted border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Image
              src="/images/CopperDog_horizontal.png"
              alt="Copper Dog Realty"
              width={180}
              height={50}
              className="h-12 w-auto mb-4"
            />
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              Boutique real estate brokerage serving Milford, Iowa and the Iowa Great Lakes region. We believe every
              home deserves a loving family, just like every dog deserves a forever home.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/properties" className="text-muted-foreground hover:text-primary transition-colors">
                  Available Homes
                </Link>
              </li>
              <li>
                <Link href="/team" className="text-muted-foreground hover:text-primary transition-colors">
                  Our Team
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Milford, Iowa</li>
              <li>Iowa Great Lakes Region</li>
              <li className="pt-2">
                <a href="mailto:info@copperdogrealty.com" className="hover:text-primary transition-colors">
                  info@copperdogrealty.com
                </a>
              </li>
              <li>
                <a href="tel:+15551234567" className="hover:text-primary transition-colors">
                  (555) 123-4567
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Copper Dog Realty. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
