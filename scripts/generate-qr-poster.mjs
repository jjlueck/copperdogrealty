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
import { Document, Page, View, Text, Svg, Path, Rect, Circle, renderToFile } from '@react-pdf/renderer'
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
  measureHelvetica,
  PAGE,
  COPY,
  LAYOUT,
} from './qr-poster.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const imagesDir = path.join(rootDir, 'public/images')
const outputDir = path.join(rootDir, 'public/resources')


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

/**
 * Read a flat multi-colour SVG into shapes we can redraw in both outputs.
 *
 * Only handles the shapes Twemoji actually uses: paths and circles with plain
 * fill attributes, no transforms, gradients or stylesheets. Anything else would
 * silently drop, so assert the counts match what the file contains.
 */
function extractShapes(file) {
  const svg = fs.readFileSync(path.join(imagesDir, file), 'utf-8')
  const viewBox = svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number)

  const shapes = []
  for (const m of svg.matchAll(/<path\s+fill="([^"]+)"\s+d="([^"]+)"/g)) {
    shapes.push({ kind: 'path', fill: m[1], d: m[2] })
  }
  for (const m of svg.matchAll(/<circle\s+fill="([^"]+)"\s+cx="([\d.]+)"\s+cy="([\d.]+)"\s+r="([\d.]+)"/g)) {
    shapes.push({ kind: 'circle', fill: m[1], cx: +m[2], cy: +m[3], r: +m[4] })
  }

  const expected = (svg.match(/<(path|circle)\b/g) || []).length
  if (shapes.length !== expected) {
    throw new Error(
      `${file}: parsed ${shapes.length} of ${expected} shapes. It uses markup this reader does not handle.`,
    )
  }
  if (/transform=|<linearGradient|<radialGradient|<style/.test(svg)) {
    throw new Error(`${file}: contains transforms, gradients or styles, which are not reproduced.`)
  }

  return { shapes, width: viewBox[2], height: viewBox[3] }
}

const tada = extractShapes('emoji/tada.svg')

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

  // The hook is a text run followed by vector artwork. SVG has no layout engine,
  // so centre the pair by measuring the text and placing both explicitly. The
  // PDF uses the same numbers rather than flexbox, so the two cannot disagree.
  const hookTextWidth = measureHelvetica(COPY.hook, { size: LAYOUT.hook.size })
  const hookWidth = hookTextWidth + LAYOUT.emoji.gap + LAYOUT.emoji.size
  const hookX = (PAGE.width - hookWidth) / 2

  return {
    matrix,
    band,
    unit,
    qrX,
    bandBox,
    hookX,
    hookTextWidth,
    hookWidth,
    emoji: {
      x: hookX + hookTextWidth + LAYOUT.emoji.gap,
      y: LAYOUT.hook.top + LAYOUT.emoji.dy,
      scale: LAYOUT.emoji.size / tada.width,
    },
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
  // Helvetica then Arial, never Helvetica Neue: measureHelvetica describes the
  // PDF base-14 Helvetica, Arial is metric-compatible with it, and Helvetica
  // Neue is not. Getting this wrong shifts the emoji relative to the text and
  // makes the SVG disagree with the PDF.
  const centered = (line, cfg, i = 0) =>
    `<text x="${PAGE.width / 2}" y="${cfg.top + cfg.size * 0.78 + i * (cfg.leading ?? 0)}" ` +
    `text-anchor="middle" font-family="Helvetica, Arial, sans-serif" ` +
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
  <text x="${g.hookX}" y="${LAYOUT.hook.top + LAYOUT.hook.size * 0.78}" text-anchor="start"
        font-family="Helvetica, Arial, sans-serif" font-size="${LAYOUT.hook.size}"
        fill="${LAYOUT.hook.color}">${COPY.hook}</text>
  <g transform="translate(${g.emoji.x} ${g.emoji.y}) scale(${g.emoji.scale})">
${tada.shapes
  .map((sh) =>
    sh.kind === 'path'
      ? `    <path fill="${sh.fill}" d="${sh.d}"/>`
      : `    <circle fill="${sh.fill}" cx="${sh.cx}" cy="${sh.cy}" r="${sh.r}"/>`,
  )
  .join('\n')}
  </g>

  <g transform="${qrTransform}" fill="${moduleColor}">
    <path d="${g.finders}" fill-rule="evenodd"/>
    <path d="${g.modules}"/>
  </g>
  <rect x="${g.bandBox.x}" y="${g.bandBox.y}" width="${g.bandBox.width}" height="${g.bandBox.height}"
        rx="${g.unit * 1.2}" fill="${PALETTE.paper}"/>
  <g transform="${dogTransform}" fill="${PALETTE.brand}">
${dachshund.ds.map((d) => `    <path d="${d}"/>`).join('\n')}
  </g>

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

      React.createElement(
        View,
        { style: { position: 'absolute', top: LAYOUT.hook.top, left: g.hookX } },
        React.createElement(
          Text,
          {
            style: {
              fontSize: LAYOUT.hook.size,
              lineHeight: LAYOUT.hook.leading / LAYOUT.hook.size,
              color: LAYOUT.hook.color,
              fontFamily: 'Helvetica',
            },
          },
          COPY.hook,
        ),
      ),
      React.createElement(
        Svg,
        {
          style: { position: 'absolute', top: g.emoji.y, left: g.emoji.x },
          width: LAYOUT.emoji.size,
          height: LAYOUT.emoji.size,
          viewBox: `0 0 ${tada.width} ${tada.height}`,
        },
        tada.shapes.map((sh, i) =>
          sh.kind === 'path'
            ? React.createElement(Path, { key: i, d: sh.d, fill: sh.fill })
            : React.createElement(Circle, {
                key: i,
                cx: sh.cx,
                cy: sh.cy,
                r: sh.r,
                fill: sh.fill,
              }),
        ),
      ),

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
