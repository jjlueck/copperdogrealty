import type { Metadata } from "next"

// The contact page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Contact Copper Dog Realty | Spirit Lake, Iowa",
  description:
    "Talk with a local agent about buying or selling a home in the Iowa Great Lakes. Visit our Spirit Lake office or send us a message.",
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
