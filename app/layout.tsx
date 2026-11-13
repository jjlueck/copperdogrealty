import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  // Without this, relative Open Graph image paths resolve against
  // localhost:3000 in the build and against the deployment URL on Vercel,
  // rather than the canonical domain.
  metadataBase: new URL("https://copperdogrealty.com"),
  // "./" resolves to each page's own path, so every page declares itself as
  // canonical. This collapses http, www and query-string variants.
  alternates: {
    canonical: "./",
  },
  // The home page's title and description. Other pages set their own.
  title: "Copper Dog Realty | Spirit Lake & Iowa Great Lakes Real Estate",
  description:
    "Boutique real estate brokerage in Spirit Lake, Iowa. Browse homes for sale and get local guidance buying or selling across Okoboji, Arnolds Park, Milford, Spencer and the Iowa Great Lakes.",
  generator: "v0.app",
  icons: {
    icon: "/images/CopperDog_icon-solid.png",
  },
  openGraph: {
    images: "/images/hero-home.jpg",
  },
  other: {
    "google-site-verification": "XNl8Dsh7BcMDKeP_PFnSkdJBFmocAKxJZPCyKK0IfFs",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
