/**
 * Pulls Google Search Console data for the site so issues can be diagnosed
 * from the terminal instead of screenshots.
 *
 * The API has no endpoint for the Page indexing, Enhancements or Core Web
 * Vitals reports. `inspect` rebuilds the Page indexing report by running the
 * URL Inspection API over every known URL and grouping by coverage state.
 *
 * Auth uses Application Default Credentials: either GOOGLE_APPLICATION_CREDENTIALS
 * pointing at a service account key (added as a user on the property), or
 * `gcloud auth application-default login`. See .claude/skills/search-console.
 *
 * Run with: pnpm gsc <check|performance|sitemaps|inspect|report> [options]
 */
import { GoogleAuth } from 'google-auth-library'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const reportsDir = path.join(rootDir, 'reports/search-console')

const PROPERTY = process.env.GSC_PROPERTY || 'https://copperdogrealty.com/'
const SITE_ORIGIN = 'https://copperdogrealty.com'
const WEBMASTERS = 'https://www.googleapis.com/webmasters/v3'
const INSPECT = 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect'

// URL Inspection allows 2,000 calls per day per property. Stay well under it.
const MAX_INSPECTIONS = 300

const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/webmasters.readonly'] })

async function call(url, { method = 'GET', data } = {}) {
  const client = await auth.getClient()
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await client.request({ url, method, data })
      return res.data
    } catch (err) {
      const status = err.response?.status
      if ((status === 429 || status >= 500) && attempt < 4) {
        await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt + Math.random() * 500))
        continue
      }
      const detail = err.response?.data?.error?.message || err.message
      if (status === 403 && !/has not been used|is disabled/.test(detail)) {
        throw new Error(`403 from Search Console: ${detail}\nIs the credential added as a user on ${PROPERTY}?`)
      }
      throw new Error(`${status || ''} ${detail}`.trim())
    }
  }
}

const site = encodeURIComponent(PROPERTY)

/** Search data lags two to three days, so end the window three days back. */
function dateRange(days) {
  const end = new Date(Date.now() - 3 * 86400000)
  const start = new Date(end.getTime() - (days - 1) * 86400000)
  const fmt = (d) => d.toISOString().slice(0, 10)
  return { startDate: fmt(start), endDate: fmt(end) }
}

async function check() {
  const { siteEntry = [] } = await call(`${WEBMASTERS}/sites`)
  const match = siteEntry.find((s) => s.siteUrl === PROPERTY)
  return {
    property: PROPERTY,
    access: match?.permissionLevel || null,
    visibleProperties: siteEntry.map((s) => `${s.siteUrl} (${s.permissionLevel})`),
  }
}

async function performance({ days = 28, dimensions = ['page'] } = {}) {
  const range = dateRange(days)
  const rows = []
  const rowLimit = 25000
  for (let startRow = 0; ; startRow += rowLimit) {
    const res = await call(`${WEBMASTERS}/sites/${site}/searchAnalytics/query`, {
      method: 'POST',
      data: { ...range, dimensions, rowLimit, startRow },
    })
    rows.push(...(res.rows || []))
    if (!res.rows || res.rows.length < rowLimit) break
  }
  return { ...range, dimensions, rows }
}

async function sitemaps() {
  const { sitemap = [] } = await call(`${WEBMASTERS}/sites/${site}/sitemaps`)
  return sitemap
}

/** Every URL we know about: submitted sitemaps, pages with impressions, and the homepage. */
async function knownUrls() {
  const urls = new Set([`${SITE_ORIGIN}/`])
  for (const sm of await sitemaps()) {
    try {
      const xml = await (await fetch(sm.path)).text()
      for (const m of xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) urls.add(m[1])
    } catch {
      // A sitemap Google knows about but we can't fetch shows up in the sitemaps output.
    }
  }
  const { rows } = await performance({ days: 90, dimensions: ['page'] })
  for (const r of rows) urls.add(r.keys[0])
  return [...urls]
}

async function inspect(urls) {
  const list = urls.length ? urls : await knownUrls()
  if (list.length > MAX_INSPECTIONS) {
    console.error(`Inspecting the first ${MAX_INSPECTIONS} of ${list.length} URLs.`)
  }
  const results = []
  for (const url of list.slice(0, MAX_INSPECTIONS)) {
    const res = await call(INSPECT, { method: 'POST', data: { inspectionUrl: url, siteUrl: PROPERTY } })
    const idx = res.inspectionResult?.indexStatusResult || {}
    results.push({
      url,
      verdict: idx.verdict,
      coverageState: idx.coverageState,
      pageFetchState: idx.pageFetchState,
      robotsTxtState: idx.robotsTxtState,
      indexingState: idx.indexingState,
      userCanonical: idx.userCanonical,
      googleCanonical: idx.googleCanonical,
      lastCrawlTime: idx.lastCrawlTime,
      referringUrls: idx.referringUrls,
      sitemap: idx.sitemap,
      richResults: res.inspectionResult?.richResultsResult,
      mobileUsability: res.inspectionResult?.mobileUsabilityResult?.verdict,
    })
  }
  const byCoverage = {}
  for (const r of results) (byCoverage[r.coverageState || 'Unknown'] ||= []).push(r.url)
  return { inspected: results.length, byCoverage, results }
}

function save(name, data) {
  const dir = path.join(reportsDir, new Date().toISOString().slice(0, 10))
  fs.mkdirSync(dir, { recursive: true })
  const file = path.join(dir, `${name}.json`)
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
  return path.relative(rootDir, file)
}

function parseArgs(argv) {
  const opts = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) opts[argv[i].slice(2)] = argv[++i]
    else opts._.push(argv[i])
  }
  return opts
}

const [command, ...rest] = process.argv.slice(2)
const opts = parseArgs(rest)

const commands = {
  check: () => check(),
  performance: () =>
    performance({
      days: Number(opts.days || 28),
      dimensions: (opts.dims || 'page').split(','),
    }),
  sitemaps: () => sitemaps(),
  inspect: () => inspect(opts._),
  report: async () => ({
    access: await check(),
    sitemaps: await sitemaps(),
    performance: await performance({ days: 28, dimensions: ['page', 'query'] }),
    indexing: await inspect([]),
  }),
}

if (!commands[command]) {
  console.error('Usage: pnpm gsc <check|performance|sitemaps|inspect|report> [options]')
  console.error('  performance --days 28 --dims page,query')
  console.error('  inspect [url ...]   (no URLs: sitemaps + pages with impressions)')
  process.exit(1)
}

try {
  const data = await commands[command]()
  if (command === 'check') {
    console.log(JSON.stringify(data, null, 2))
  } else {
    console.log(`Saved ${save(command, data)}`)
    if (data.byCoverage || data.indexing?.byCoverage) {
      const groups = data.byCoverage || data.indexing.byCoverage
      for (const [state, urls] of Object.entries(groups)) console.log(`${urls.length}\t${state}`)
    }
  }
} catch (err) {
  console.error(err.message)
  process.exit(1)
}
