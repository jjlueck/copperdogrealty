import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    // Don't disallow /api/: the home and properties pages load listings from it
    // client-side, and Googlebot can't render what robots.txt blocks.
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://copperdogrealty.com/sitemap.xml",
  }
}
