export interface UtilityProvider {
  category: string
  items: string[]
}

export interface CityUtilities {
  city: string
  providers: UtilityProvider[]
}

export function cityToSlug(city: string): string {
  return city.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
}

export interface ParsedProviderItem {
  providerName: string
  url?: string
  rest: string
}

/**
 * Parses a provider item string. When a URL is present, the provider name
 * (text before "—" or " - ") becomes the link target; the link after the phone is omitted.
 * Example: "Alliant Energy — ☎️ 800-255-4268 | [alliantenergy.com](url)"
 * becomes: providerName "Alliant Energy" (link), rest " — ☎️ 800-255-4268"
 * Handles both em dash (—) and hyphen ( - ) separators so entries like
 * "CenturyLink - ☎️ 800-244-1111 | [getcenturylink.com](url)" parse correctly.
 */
export function parseProviderItem(item: string): ParsedProviderItem {
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
