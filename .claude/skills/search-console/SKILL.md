---
name: search-console
description: Pull Google Search Console data for copperdogrealty.com (indexing status, search performance, sitemaps) and diagnose SEO issues against the codebase. Use when the user mentions Search Console, GSC, indexing errors, "page not indexed", "crawled but not indexed", canonical or redirect problems, sitemaps, or search rankings/traffic for this site.
---

# Search Console

`pnpm gsc` (scripts/search-console.mjs) reads the Search Console API for
the URL-prefix property `https://copperdogrealty.com/`. Results land in `reports/search-console/<date>/`
(gitignored).

## Commands

| Command | What it gives you |
|---|---|
| `pnpm gsc check` | Confirms credentials and permission level on the property. Run first. |
| `pnpm gsc report` | Everything below in one file. Default starting point. |
| `pnpm gsc inspect [url ...]` | Per-URL index status. No URLs: every URL from submitted sitemaps plus pages with impressions in the last 90 days. Prints counts per coverage state. |
| `pnpm gsc performance --days 28 --dims page,query` | Clicks, impressions, CTR, position. Dims: `query`, `page`, `country`, `device`, `date`, `searchAppearance`. |
| `pnpm gsc sitemaps` | Submitted sitemaps with error and warning counts. |

## What the API cannot see

There is no API for the **Page indexing**, **Enhancements** or **Core Web
Vitals** reports. `inspect` rebuilds Page indexing from per-URL results, but it
only covers URLs we already know about. Google's report also includes URLs it
found through links (old paths, query-string variants) that never appear in a
sitemap or in search results. If the user's UI numbers exceed ours, ask them to
export the example URLs from the UI report and run `pnpm gsc inspect <urls>`.

URL Inspection is capped at 2,000 calls per day per property. The script stops
at 300 per run.

## Diagnosing

1. Run `pnpm gsc report`, then read the JSON. Group `indexing.results` by `coverageState`.
2. For each problem group, compare `userCanonical` vs `googleCanonical`,
   `pageFetchState`, `indexingState` and `referringUrls`, then find the cause in
   code: `app/layout.tsx` metadata, per-page `metadata`/`generateMetadata`,
   `app/sitemap.ts` / `app/robots.ts`, `next.config.mjs` redirects, and
   `app/properties/[id]` for listings that expire.
3. Check the live response with `curl -sI` and `curl -s` before blaming code.
   Production is on Vercel.
4. Confirm current Google guidance with a web search when a coverage state is
   ambiguous. Common states:
   - **Discovered/Crawled, currently not indexed**: quality or crawl budget, usually thin or near-duplicate pages.
   - **Duplicate without user-selected canonical** / **Google chose different canonical**: missing or conflicting `<link rel="canonical">`.
   - **Page with redirect**, **Not found (404)**, **Soft 404**: stale links or sitemap entries, or listing pages for sold properties.
   - **Excluded by 'noindex' tag**: check metadata `robots`.

## Setup (one time, done by the user)

Credentials are Application Default Credentials. Either:

- **Service account (recommended for automation).** Create one in a Google Cloud
  project with the Search Console API enabled. Download its JSON key to a path
  outside the repo. Add its `client_email` as a **Full** user in Search
  Console (Settings > Users and permissions). Set
  `GOOGLE_APPLICATION_CREDENTIALS=<path>` in `.env.local`.
- **Your own Google login.** `gcloud auth application-default login --scopes=https://www.googleapis.com/auth/webmasters.readonly,https://www.googleapis.com/auth/cloud-platform`

Never read, print or commit the key file's contents.
