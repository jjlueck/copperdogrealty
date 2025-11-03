import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Copper Dog Realty - Iowa Great Lakes Real Estate",
  description:
    "Boutique real estate brokerage serving the Iowa Great Lakes region. Find your perfect home with personalized service.",
  generator: "v0.app",
  icons: {
    icon: "/images/CopperDog_icon-solid.png",
  },
  openGraph: {
    images: "/images/hero-home.jpg",
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
