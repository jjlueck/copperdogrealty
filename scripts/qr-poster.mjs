/**
 * Geometry for the Good Dog Library QR card (/share-your-dog).
 *
 * Pure: no file I/O and no rendering. scripts/generate-qr-poster.mjs turns this
 * into an SVG and a PDF, and scripts/qr-poster.test.mjs exercises it directly.
 * Both output formats consume the same model so they cannot drift apart.
 */
import qrcode from 'qrcode-generator'

/** What the code resolves to. Printed cards die if this ever changes. */
export const SHARE_URL = 'https://copperdogrealty.com/share-your-dog'

/**
 * Brand palette, converted from the oklch tokens in app/globals.css to sRGB.
 *
 * `copper` carries the QR modules. Measured against `paper` it is 5.33:1,
 * versus 14.67:1 for `ink`, so it was not the safe default. It was adopted
 * after the printed card was scanned in place and read reliably, which beats
 * the contrast heuristic for this specific code at this specific size.
 *
 * That makes the decode tests load-bearing rather than a formality: copper has
 * less margin, so any future change to module size, rounding or logo area must
 * be re-verified rather than assumed. See scripts/qr-poster.test.mjs and
 * e2e/share-your-dog-qr.spec.ts.
 */
export const PALETTE = {
  paper: '#f9f4ee', // --background, warm cream
  ink: '#2a1f1a', // --foreground, dark warm brown
  copper: '#a84811', // --primary
  muted: '#6b5b4d',
  // The logo files ship this copper, a shade off --primary. The dachshund and
  // wordmark use it so they match each other in print.
  brand: '#983c23',
}

/** Error correction level H tolerates ~30% loss. That headroom is what lets a logo sit in the middle. */
export const ERROR_CORRECTION = 'H'

/** Modules of blank paper required around the code by the spec. */
export const QUIET_ZONE = 4

/**
 * Encode the URL and return the module grid.
 * Version 0 lets the encoder pick the smallest version that fits.
 */
export function buildMatrix(url = SHARE_URL) {
  const qr = qrcode(0, ERROR_CORRECTION)
  qr.addData(url)
  qr.make()

  const size = qr.getModuleCount()
  const dark = []
  for (let row = 0; row < size; row++) {
    const line = []
    for (let col = 0; col < size; col++) line.push(qr.isDark(row, col))
    dark.push(line)
  }

  return { size, dark, version: (size - 17) / 4, url }
}

/** Top-left corner of each of the three 7x7 finder patterns. */
export function finderOrigins(size) {
  return [
    { row: 0, col: 0 },
    { row: 0, col: size - 7 },
    { row: size - 7, col: 0 },
  ]
}

export function isFinderModule(size, row, col) {
  return finderOrigins(size).some(
    (o) => row >= o.row && row < o.row + 7 && col >= o.col && col < o.col + 7,
  )
}

/**
 * Alignment pattern centres per ISO/IEC 18004 Annex E.
 *
 * Only needed to prove the logo does not land on one. Capped at version 10:
 * the current URL is version 5, and a version past 10 means the URL grew a lot
 * and the whole layout wants re-checking anyway, so failing loudly beats
 * silently skipping the assertion.
 */
const ALIGNMENT_CENTRES = {
  1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30],
  6: [6, 34], 7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50],
}

/**
 * Every module a scanner needs structurally intact: finders and their
 * separators, both timing lines, format/version info, and alignment patterns.
 * Covering any of these breaks detection no matter how much ECC is left.
 */
export function reservedModules(size) {
  const version = (size - 17) / 4
  const centres = ALIGNMENT_CENTRES[version]
  if (!centres) {
    throw new Error(
      `No alignment table for QR version ${version}. Extend ALIGNMENT_CENTRES and re-check the card layout.`,
    )
  }

  const reserved = new Set()
  const add = (row, col) => {
    if (row >= 0 && row < size && col >= 0 && col < size) reserved.add(`${row},${col}`)
  }

  // Finders plus a 1-module separator and the format-info band around each.
  for (const o of finderOrigins(size)) {
    for (let r = o.row - 1; r <= o.row + 7; r++) {
      for (let c = o.col - 1; c <= o.col + 7; c++) add(r, c)
    }
  }

  // Timing patterns run the full width and height on row 6 and column 6.
  for (let i = 0; i < size; i++) {
    add(6, i)
    add(i, 6)
  }

  // Alignment patterns are 5x5, centred on each pairing that misses a finder.
  for (const r of centres) {
    for (const c of centres) {
      const nearFinder =
        (r <= 8 && c <= 8) || (r <= 8 && c >= size - 9) || (r >= size - 9 && c <= 8)
      if (nearFinder) continue
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) add(r + dr, c + dc)
      }
    }
  }

  return reserved
}

/**
 * The knockout the dachshund sits in, in module units.
 *
 * A horizontal band rather than a square because the brand dog is long and low
 * (viewBox 285.94 x 154.81). Matching its shape costs far less of the error
 * correction budget than a square big enough to hold it would.
 *
 * Snapped to whole modules and to odd dimensions so it centres exactly on an
 * odd grid, which keeps it clear of the timing lines.
 */
export function logoBand(size, { widthRatio = 0.46, aspect = 285.94 / 154.81 } = {}) {
  const toOdd = (n) => (n % 2 === 0 ? n - 1 : n)
  const cols = toOdd(Math.round(size * widthRatio))
  const rows = toOdd(Math.round(cols / aspect))

  return {
    cols,
    rows,
    col: (size - cols) / 2,
    row: (size - rows) / 2,
    /** Share of the grid the logo hides. Compare against the ~30% ECC-H budget. */
    coverage: (cols * rows) / (size * size),
  }
}

export function isUnderBand(band, row, col) {
  return (
    row >= band.row && row < band.row + band.rows && col >= band.col && col < band.col + band.cols
  )
}

/** One rounded square, as SVG path commands, in module units. */
function roundedSquare(x, y, size, radius) {
  const r = Math.min(radius, size / 2)
  return [
    `M${x + r},${y}`,
    `H${x + size - r}`,
    `A${r},${r} 0 0 1 ${x + size},${y + r}`,
    `V${y + size - r}`,
    `A${r},${r} 0 0 1 ${x + size - r},${y + size}`,
    `H${x + r}`,
    `A${r},${r} 0 0 1 ${x},${y + size - r}`,
    `V${y + r}`,
    `A${r},${r} 0 0 1 ${x + r},${y}`,
    'Z',
  ].join(' ')
}

/**
 * Path covering every dark data module, skipping the three finders (drawn
 * separately, styled) and anything hidden behind the logo.
 *
 * Rounding is kept modest: it softens the code to match the brand without
 * eroding the module edges a scanner thresholds on.
 */
export function modulesPath({ size, dark }, band, { radius = 0.32 } = {}) {
  const parts = []
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!dark[row][col]) continue
      if (isFinderModule(size, row, col)) continue
      if (band && isUnderBand(band, row, col)) continue
      parts.push(roundedSquare(col, row, 1, radius))
    }
  }
  return parts.join(' ')
}

/**
 * The three corner eyes, drawn as shapes rather than module-by-module.
 *
 * The 7:5:3 geometry and the 1-module ring thickness are preserved exactly,
 * because that 1:1:3:1:1 ratio is what a scanner locks onto. Only the corners
 * are rounded. Uses fill-rule evenodd to punch the ring's hole.
 */
export function findersPath(size, { outer = 1.15, inner = 0.75, centre = 0.6 } = {}) {
  const parts = []
  for (const o of finderOrigins(size)) {
    parts.push(roundedSquare(o.col, o.row, 7, outer))
    parts.push(roundedSquare(o.col + 1, o.row + 1, 5, inner))
    parts.push(roundedSquare(o.col + 2, o.row + 2, 3, centre))
  }
  return parts.join(' ')
}

/**
 * Render the finished code to raw RGBA pixels, logo knockout included.
 *
 * Exists so the test can hand a real image to a real decoder and prove the
 * thing still scans. Builds the buffer arithmetically from the grid, so no
 * canvas or rasteriser is needed.
 */
export function rasterize({ size, dark }, band, { scale = 8, quietZone = QUIET_ZONE } = {}) {
  const width = (size + quietZone * 2) * scale
  const height = width
  const data = new Uint8ClampedArray(width * height * 4).fill(255)

  const paint = (px, py, on) => {
    const i = (py * width + px) * 4
    const v = on ? 0 : 255
    data[i] = v
    data[i + 1] = v
    data[i + 2] = v
    data[i + 3] = 255
  }

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      // The band is paper-coloured, so anything under it reads as light.
      const on = dark[row][col] && !(band && isUnderBand(band, row, col))
      if (!on) continue
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          paint((col + quietZone) * scale + dx, (row + quietZone) * scale + dy, true)
        }
      }
    }
  }

  return { data, width, height }
}

/**
 * Advance widths for the PDF base-14 Helvetica faces, in 1/1000 em, covering
 * printable ASCII (code 32 to 126). Fixed by the PDF specification, so these
 * are exact rather than an approximation of whatever font a viewer substitutes.
 *
 * Needed because the card centres a line of text next to a vector emoji, and
 * SVG has no layout engine to do that for us. Also lets the tests assert the
 * copy still fits on one line instead of trusting a comment.
 */
const HELVETICA_WIDTHS = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
  1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
  333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
  556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
]

const HELVETICA_BOLD_WIDTHS = [
  278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611,
  975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556,
  333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611,
  611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584,
]

/**
 * Width of a Helvetica string in points.
 *
 * Non-ASCII characters (an emoji, for instance) have no width here and are
 * skipped, which is correct for this card: the emoji is drawn as vector
 * artwork beside the text rather than set as a glyph.
 */
export function measureHelvetica(text, { size = 12, bold = false } = {}) {
  const table = bold ? HELVETICA_BOLD_WIDTHS : HELVETICA_WIDTHS
  let mille = 0
  for (const char of text) {
    const code = char.codePointAt(0)
    if (code < 32 || code > 126) continue
    mille += table[code - 32]
  }
  return (mille / 1000) * size
}

/* ------------------------------------------------------- the card ----- */
/* Kept here rather than in the generator so the tests can check the copy
   still fits on one line without importing a module that writes files. */

/** 5x7in at 72pt/in. Sized to sit on the library door without overwhelming it. */
export const PAGE = { width: 360, height: 504 }

export const COPY = {
  headline: ['Share a picture of your dog.'],
  // The tada emoji is deliberately not part of this string. PDF's built-in
  // Helvetica has no emoji glyphs, so setting it as text renders "<\u2030"
  // in the print file. It is drawn as vector artwork beside the text instead.
  hook: 'Your dog could be our Dog of the Month!',
}

/** Usable width inside the card, used to check the copy still fits one line. */
export const CONTENT_WIDTH = 300

/**
 * Absolute positions, shared by both renderers. `top` is the top of each text
 * box; the SVG renderer converts that to a baseline.
 */
export const LAYOUT = {
  headline: { top: 62, size: 21, leading: 25, color: PALETTE.copper, bold: true },
  hook: { top: 100, size: 12, leading: 15, color: PALETTE.ink },
  // Sized a little above the text's cap height and nudged up, so it sits
  // optically centred on the line rather than on the baseline.
  emoji: { size: 13, gap: 4, dy: -1.4 },
  // Deliberately unchanged at 272pt. The space freed by dropping the
  // instruction line went into whitespace rather than a bigger code, so the
  // scanned artwork stays exactly as tested.
  qr: { top: 136, size: 272 },
  wordmark: { top: 434, width: 180 },
}
