import React from "react"
import {
  Document,
  Page,
  Text,
  View,
  Link,
  StyleSheet,
  Image,
  renderToFile,
} from "@react-pdf/renderer"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, "..")
const utilitiesPath = path.join(rootDir, "app/constants/utilities.json")
const outputDir = path.join(rootDir, "public/resources")
const logoPath = path.join(rootDir, "public/images/CopperDog_icon-solid.png")
const wordMarkPath = path.join(rootDir, "public/images/CopperDog_word-mark.jpg")

const cities = JSON.parse(fs.readFileSync(utilitiesPath, "utf-8"))

function cityToSlug(city) {
  return city.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
}

function stripForPdf(text) {
  return text.replace(/☎️\s*/g, "").trim()
}

function parseProviderItem(item) {
  const linkMatch = item.match(/\[([^\]]+)\]\(([^)]+)\)/)
  if (!linkMatch) {
    return { providerName: "", url: undefined, rest: item }
  }
  const url = linkMatch[2]
  const emDashIndex = item.indexOf(" — ")
  const hyphenIndex = item.indexOf(" - ")
  const separatorIndex =
    emDashIndex >= 0 && hyphenIndex >= 0
      ? Math.min(emDashIndex, hyphenIndex)
      : emDashIndex >= 0
        ? emDashIndex
        : hyphenIndex
  const separatorLen = separatorIndex >= 0 ? 3 : 0
  const providerName =
    separatorIndex >= 0 ? item.slice(0, separatorIndex).trim() : linkMatch[1]
  const afterDash = separatorIndex >= 0 ? item.slice(separatorIndex + separatorLen) : ""
  const restWithoutLink = afterDash
    .replace(/\[[^\]]+\]\([^)]+\)/g, "")
    .replace(/(\s*[\|\/]\s*)+$/, "")
    .trim()
  const rest = restWithoutLink ? ` — ${restWithoutLink}` : ""
  return { providerName, url, rest }
}

const sectionPadding = 16

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
  },
  topLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    marginBottom: sectionPadding,
  },
  citySeparatorLine: {
    borderTopWidth: 1,
    borderTopColor: "#333",
    marginTop: sectionPadding,
    marginBottom: sectionPadding,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  logo: {
    width: 72,
    height: 72,
    marginRight: 16,
  },
  wordMark: {
    height: 48,
    width: 300,
  },
  cityHeader: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 0,
    marginBottom: 8,
  },
  category: {
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 6,
    marginBottom: 2,
  },
  item: {
    marginLeft: 8,
    marginBottom: 2,
  },
  link: {
    color: "#0066cc",
  },
  sectionSpacing: {
    height: sectionPadding,
  },
  bottomLine: {
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingTop: 12,
  },
  footer: {
    textAlign: "center",
    fontSize: 10,
    marginBottom: 8,
  },
  footerLink: {
    fontSize: 10,
    color: "#0066cc",
  },
  dogRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dogIcon: {
    width: 40,
    height: 40,
    marginHorizontal: 10,
  },
})

function UtilitiesDocument({ citiesData }) {
  const topSection = React.createElement(
    View,
    null,
    React.createElement(
      View,
      { style: styles.logoRow },
      React.createElement(Image, { src: logoPath, style: styles.logo }),
      React.createElement(Image, { src: wordMarkPath, style: styles.wordMark })
    ),
    React.createElement(View, { style: styles.topLine })
  )

  const useSeparatorLines = citiesData.length > 1

  const citySections = citiesData.map((cityData, index) => {
    const isFirstCity = index === 0
    const needsTopSpacing = useSeparatorLines && isFirstCity
    const providerBlocks = cityData.providers.map((provider) =>
      React.createElement(
        View,
        { key: provider.category },
        React.createElement(Text, { style: styles.category }, provider.category),
        ...provider.items.map((item, i) => {
          const parsed = parseProviderItem(item)
          const content =
            parsed.url && parsed.providerName
              ? [
                  React.createElement(
                    Link,
                    { key: "link", href: parsed.url, style: styles.link },
                    stripForPdf(parsed.providerName)
                  ),
                  " " + stripForPdf(parsed.rest),
                ]
              : stripForPdf(parsed.rest || item)
          return React.createElement(
            Text,
            { key: i, style: styles.item },
            content
          )
        })
      )
    )
    const cityContent = [
      React.createElement(Text, { key: "header", style: styles.cityHeader }, cityData.city),
      ...providerBlocks,
    ]
    if (useSeparatorLines && index > 0) {
      return React.createElement(
        View,
        { key: cityData.city },
        React.createElement(View, { style: styles.citySeparatorLine }),
        ...cityContent
      )
    }
    const firstCityStyle = needsTopSpacing ? { marginTop: sectionPadding } : undefined
    return React.createElement(View, { key: cityData.city, style: firstCityStyle }, ...cityContent)
  })

  const dogIcons = Array.from({ length: 8 }, (_, i) =>
    React.createElement(Image, {
      key: i,
      src: logoPath,
      style: styles.dogIcon,
    })
  )

  const footerSection = React.createElement(
    View,
    null,
    React.createElement(View, { style: styles.sectionSpacing }),
    React.createElement(View, { style: styles.bottomLine },
      React.createElement(
        Text,
        { style: styles.footer },
        "Copper Dog Realty • 1715 Hill Ave, Suite 1, Spirit Lake, Iowa 51360 • (712) 330-4793 • ",
        React.createElement(Link, { href: "mailto:info@copperdogrealty.com", style: styles.footerLink }, "info@copperdogrealty.com")
      ),
      React.createElement(View, { style: styles.dogRow }, ...dogIcons)
    )
  )

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: "A4", style: styles.page },
      topSection,
      ...citySections,
      footerSection
    )
  )
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

console.log("Generating utility PDFs...")

for (const cityData of cities) {
  const slug = cityToSlug(cityData.city)
  const outputPath = path.join(outputDir, `utilities-${slug}.pdf`)
  const doc = UtilitiesDocument({
    citiesData: [cityData],
    title: `Local Area Utility Providers – ${cityData.city}`,
  })
  await renderToFile(doc, outputPath)
  console.log(`  Generated utilities-${slug}.pdf`)
}

const allCitiesDoc = UtilitiesDocument({
  citiesData: cities,
  title: "Local Area Utility Providers – All Cities",
})
await renderToFile(allCitiesDoc, path.join(outputDir, "utilities-all-cities.pdf"))
console.log("  Generated utilities-all-cities.pdf")

console.log(`Done. PDFs written to ${outputDir}`)