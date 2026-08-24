/**
 * Generates the printable QR card that points at /share-your-dog.
 *
 * Emits an SVG (vector master, opens in any browser) and a 5x7in PDF (what you
 * actually print). Both are drawn from the same geometry in qr-poster.mjs and
 * the same LAYOUT below, so the preview and the print file cannot drift.
 *
 * Run with: pnpm generate-qr
 */
import React from 'react'
import { Document, Page, View, Text, Svg, Path, Rect, renderToFile } from '@react-pdf/renderer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  SHARE_URL,
  PALETTE,
  buildMatrix,
  logoBand,
  modulesPath,
  findersPath,
} from './qr-poster.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const imagesDir = path.join(rootDir, 'public/images')
const outputDir = path.join(rootDir, 'public/resources')

/** 5x7in at 72pt/in. Sized to sit on the library door without overwhelming it. */
const PAGE = { width: 360, height: 504 }

const COPY = {
  // Each of these has to sit on one line. At 300pt of usable width the
  // headline fits up to 22.6pt and the hook up to 16.7pt (measured, Helvetica),
  // so the sizes in LAYOUT are set below those with room to spare. Lengthening
  // either string means re-checking that it still fits: react-pdf would wrap it
  // and the SVG would simply overflow the card.
  headline: ['Share a picture of your dog.'],
  hook: ['Your dog could be our Dog of the Month.'],
  instruction: 'Point your phone camera at the code',
}

/**
 * Absolute positions, shared by both renderers. `top` is the top of each text
 * box; the SVG renderer converts that to a baseline.
 */
const LAYOUT = {
  headline: { top: 52, size: 21, leading: 25, color: PALETTE.copper, bold: true },
  hook: { top: 89, size: 12, leading: 15, color: PALETTE.ink },
  qr: { top: 124, size: 272 },
  instruction: { top: 414, size: 10.5, color: PALETTE.muted },
  wordmark: { top: 443, width: 180 },
}

/** Pull the path data out of a brand SVG so the logo files stay the source of truth. */
function extractPaths(file) {
  const svg = fs.readFileSync(path.join(imagesDir, file), 'utf-8')
  const viewBox = svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number)
  const ds = [...svg.matchAll(/\sd="([^"]+)"/g)].map((m) => m[1])
  if (!ds.length) throw new Error(`No paths found in ${file}`)
  return { ds, width: viewBox[2], height: viewBox[3] }
}

const dachshund = extractPaths('CopperDog_icon-solid.svg')
const wordmark = extractPaths('CopperDog_word-mark.svg')

/** Fit a viewBox inside a box, preserving aspect and centring. */
function fit(art, box) {
  const scale = Math.min(box.width / art.width, box.height / art.height)
  return {
    scale,
    x: box.x + (box.width - art.width * scale) / 2,
    y: box.y + (box.height - art.height * scale) / 2,
  }
}

function geometry() {
  const matrix = buildMatrix()
  const band = logoBand(matrix.size)
  const unit = LAYOUT.qr.size / matrix.size
  const qrX = (PAGE.width - LAYOUT.qr.size) / 2

  const bandBox = {
    x: qrX + band.col * unit,
    y: LAYOUT.qr.top + band.row * unit,
    width: band.cols * unit,
    height: band.rows * unit,
  }
  // Breathing room so the dog does not touch the surrounding modules.
  const inset = unit * 0.55
  const dogBox = {
    x: bandBox.x + inset,
    y: bandBox.y + inset,
    width: bandBox.width - inset * 2,
    height: bandBox.height - inset * 2,
  }

  return {
    matrix,
    band,
    unit,
    qrX,
    bandBox,
    dog: fit(dachshund, dogBox),
    modules: modulesPath(matrix, band),
    finders: findersPath(matrix.size),
    wordmarkFit: fit(wordmark, {
      x: (PAGE.width - LAYOUT.wordmark.width) / 2,
      y: LAYOUT.wordmark.top,
      width: LAYOUT.wordmark.width,
      height: LAYOUT.wordmark.width / (wordmark.width / wordmark.height),
    }),
  }
}

/* ---------------------------------------------------------------- SVG ----- */

function renderSvg(g, moduleColor) {
  const centered = (line, cfg, i = 0) =>
    `<text x="${PAGE.width / 2}" y="${cfg.top + cfg.size * 0.78 + i * (cfg.leading ?? 0)}" ` +
    `text-anchor="middle" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" ` +
    `font-size="${cfg.size}"${cfg.bold ? ' font-weight="700"' : ''} fill="${cfg.color}">${line}</text>`

  const qrTransform = `translate(${g.qrX} ${LAYOUT.qr.top}) scale(${g.unit})`
  const dogTransform = `translate(${g.dog.x} ${g.dog.y}) scale(${g.dog.scale})`
  const wmTransform = `translate(${g.wordmarkFit.x} ${g.wordmarkFit.y}) scale(${g.wordmarkFit.scale})`

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${PAGE.width}" height="${PAGE.height}" viewBox="0 0 ${PAGE.width} ${PAGE.height}">
  <rect width="${PAGE.width}" height="${PAGE.height}" fill="${PALETTE.paper}"/>
  <rect x="12" y="12" width="${PAGE.width - 24}" height="${PAGE.height - 24}" rx="10"
        fill="none" stroke="${PALETTE.copper}" stroke-width="1.25" opacity="0.5"/>

${COPY.headline.map((l, i) => '  ' + centered(l, LAYOUT.headline, i)).join('\n')}
${COPY.hook.map((l, i) => '  ' + centered(l, LAYOUT.hook, i)).join('\n')}

  <g transform="${qrTransform}" fill="${moduleColor}">
    <path d="${g.finders}" fill-rule="evenodd"/>
    <path d="${g.modules}"/>
  </g>
  <rect x="${g.bandBox.x}" y="${g.bandBox.y}" width="${g.bandBox.width}" height="${g.bandBox.height}"
        rx="${g.unit * 1.2}" fill="${PALETTE.paper}"/>
  <g transform="${dogTransform}" fill="${PALETTE.brand}">
${dachshund.ds.map((d) => `    <path d="${d}"/>`).join('\n')}
  </g>

  ${centered(COPY.instruction, LAYOUT.instruction)}

  <g transform="${wmTransform}" fill="${PALETTE.brand}">
${wordmark.ds.map((d) => `    <path d="${d}"/>`).join('\n')}
  </g>
</svg>
`
}

/* ---------------------------------------------------------------- PDF ----- */

function textBlock(lines, cfg) {
  return React.createElement(
    View,
    { style: { position: 'absolute', top: cfg.top, left: 0, width: PAGE.width } },
    lines.map((line, i) =>
      React.createElement(
        Text,
        {
          key: i,
          style: {
            textAlign: 'center',
            fontSize: cfg.size,
            lineHeight: (cfg.leading ?? cfg.size * 1.2) / cfg.size,
            color: cfg.color,
            fontFamily: cfg.bold ? 'Helvetica-Bold' : 'Helvetica',
          },
        },
        line,
      ),
    ),
  )
}

function absoluteSvg(box, art, children) {
  return React.createElement(
    Svg,
    {
      style: { position: 'absolute', top: box.y, left: box.x },
      width: art.width * box.scale,
      height: art.height * box.scale,
      viewBox: `0 0 ${art.width} ${art.height}`,
    },
    children,
  )
}

function PosterDocument({ g, moduleColor }) {
  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: PAGE, style: { backgroundColor: PALETTE.paper } },

      React.createElement(View, {
        style: {
          position: 'absolute',
          top: 12,
          left: 12,
          width: PAGE.width - 24,
          height: PAGE.height - 24,
          borderWidth: 1.25,
          borderColor: PALETTE.copper,
          borderRadius: 10,
          opacity: 0.5,
        },
      }),

      textBlock(COPY.headline, LAYOUT.headline),
      textBlock(COPY.hook, LAYOUT.hook),

      // QR: one viewBox of module units, scaled by react-pdf.
      React.createElement(
        Svg,
        {
          style: { position: 'absolute', top: LAYOUT.qr.top, left: g.qrX },
          width: LAYOUT.qr.size,
          height: LAYOUT.qr.size,
          viewBox: `0 0 ${g.matrix.size} ${g.matrix.size}`,
        },
        React.createElement(Path, { d: g.finders, fill: moduleColor, fillRule: 'evenodd' }),
        React.createElement(Path, { d: g.modules, fill: moduleColor }),
        React.createElement(Rect, {
          x: g.band.col,
          y: g.band.row,
          width: g.band.cols,
          height: g.band.rows,
          rx: 1.2,
          fill: PALETTE.paper,
        }),
      ),

      absoluteSvg(
        g.dog,
        dachshund,
        dachshund.ds.map((d, i) => React.createElement(Path, { key: i, d, fill: PALETTE.brand })),
      ),

      textBlock([COPY.instruction], LAYOUT.instruction),

      absoluteSvg(
        g.wordmarkFit,
        wordmark,
        wordmark.ds.map((d, i) => React.createElement(Path, { key: i, d, fill: PALETTE.brand })),
      ),
    ),
  )
}

/* --------------------------------------------------------------- main ----- */

// Copper, settled by scanning a printed card rather than by contrast maths.
// See the note on PALETTE in qr-poster.mjs.
const MODULE_COLOR = PALETTE.copper
const BASE = 'share-your-dog-qr'

const g = geometry()
fs.mkdirSync(outputDir, { recursive: true })

fs.writeFileSync(path.join(outputDir, `${BASE}.svg`), renderSvg(g, MODULE_COLOR))
await renderToFile(
  React.createElement(PosterDocument, { g, moduleColor: MODULE_COLOR }),
  path.join(outputDir, `${BASE}-5x7.pdf`),
)
console.log(`  ${BASE}.svg + ${BASE}-5x7.pdf`)

console.log(
  `\nEncoded ${SHARE_URL}\n` +
    `QR version ${g.matrix.version} (${g.matrix.size}x${g.matrix.size}), ` +
    `logo covers ${(g.band.coverage * 100).toFixed(1)}% of the grid.`,
)
