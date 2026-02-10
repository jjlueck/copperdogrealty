import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog"

export function Header() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/CopperDog_icon-solid.png"
            alt="Copper Dog Realty"
            width={23}
            height={23}
            className="h-6 w-auto md:h-6"
          />
          <Image
            src="/images/CopperDog_word-mark.svg"
            alt="Copper Dog Realty"
            width={30}
            height={12}
            className="h-3 w-auto md:h-6"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-x-8">
          <Link href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors shrink-0">
            Home
          </Link>
          <Link href="/properties" className="text-sm font-medium text-foreground hover:text-primary transition-colors shrink-0">
            Available Homes
          </Link>
          <Link href="/team" className="text-sm font-medium text-foreground hover:text-primary transition-colors shrink-0">
            Our Team
          </Link>
          <Link href="/resources" className="text-sm font-medium text-foreground hover:text-primary transition-colors shrink-0">
            Resources
          </Link>
          <Link href="/about" className="text-sm font-medium text-foreground hover:text-primary transition-colors shrink-0">
            About
          </Link>
          <Button asChild className="shrink-0">
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </nav>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="md:hidden bg-transparent">
              Menu
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xs">
            <DialogTitle className="sr-only">Main Menu</DialogTitle>
            <nav className="flex flex-col gap-4 p-4">
              <Link href="/" className="text-lg font-medium text-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/properties" className="text-lg font-medium text-foreground hover:text-primary transition-colors">
                Available Homes
              </Link>
              <Link href="/team" className="text-lg font-medium text-foreground hover:text-primary transition-colors">
                Our Team
              </Link>
              <Link href="/resources" className="text-lg font-medium text-foreground hover:text-primary transition-colors">
                Resources
              </Link>
              <Link href="/about" className="text-lg font-medium text-foreground hover:text-primary transition-colors">
                About
              </Link>
              <Button asChild>
                <Link href="/contact">Get in Touch</Link>
              </Button>
            </nav>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  )
}
