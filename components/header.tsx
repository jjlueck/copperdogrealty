import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/CopperDog_horizontal.png"
            alt="Copper Dog Realty"
            width={180}
            height={50}
            className="h-12 w-auto"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/properties" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Available Homes
          </Link>
          <Link href="/team" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Our Team
          </Link>
          <Link href="/about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            About
          </Link>
          <Button asChild>
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </nav>

        <Button variant="outline" className="md:hidden bg-transparent">
          Menu
        </Button>
      </div>
    </header>
  )
}
