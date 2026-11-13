import { describe, it, expect } from 'vitest'
import jsQR from 'jsqr'
import {
  SHARE_URL,
  QUIET_ZONE,
  COPY,
  LAYOUT,
  CONTENT_WIDTH,
  measureHelvetica,
  buildMatrix,
  logoBand,
  reservedModules,
  isUnderBand,
  rasterize,
  modulesPath,
  findersPath,
} from './qr-poster.mjs'

const matrix = buildMatrix()
const band = logoBand(matrix.size)

const decode = (m, b, opts) => {
  const { data, width, height } = rasterize(m, b, opts)
  return jsQR(data, width, height)?.data ?? null
}

describe('QR payload', () => {
  it('encodes the live share-your-dog URL', () => {
    expect(SHARE_URL).toBe('https://copperdogrealty.com/share-your-dog')
  })

  it('fits in version 5 at error correction H', () => {
    expect(matrix.version).toBe(5)
    expect(matrix.size).toBe(37)
  })
})

describe('logo knockout', () => {
  it('stays well inside the error correction budget', () => {
    // Level H tolerates roughly 30%. Anything approaching that is asking a
    // printed sign to work at the edge of the spec.
    expect(band.coverage).toBeLessThan(0.15)
  })

  it('never covers a module a scanner needs structurally', () => {
    // Finders, separators, timing lines and alignment patterns are not
    // recoverable by error correction. Covering one kills detection outright.
    const reserved = reservedModules(matrix.size)
    const clashes = []
    for (let row = 0; row < matrix.size; row++) {
      for (let col = 0; col < matrix.size; col++) {
        if (isUnderBand(band, row, col) && reserved.has(`${row},${col}`)) {
          clashes.push(`${row},${col}`)
        }
      }
    }
    expect(clashes).toEqual([])
  })

  it('matches the dachshund proportions', () => {
    // A square knockout big enough for a long dog would cost far more area.
    expect(band.cols / band.rows).toBeGreaterThan(1.5)
  })
})

describe('scannability', () => {
  it('decodes back to the URL with the logo knocked out', () => {
    // The test that matters. Everything else is a proxy for this.
    expect(decode(matrix, band)).toBe(SHARE_URL)
  })

  it('decodes with no logo at all', () => {
    expect(decode(matrix, null)).toBe(SHARE_URL)
  })

  it('still decodes at a coarse scan resolution', () => {
    // Approximates a phone reading a small printed code from a distance.
    expect(decode(matrix, band, { scale: 3 })).toBe(SHARE_URL)
  })

  it('fails once the knockout grows too large', () => {
    // Negative control: proves these assertions are actually sensitive to the
    // logo size, rather than passing because the decoder is forgiving.
    const greedy = logoBand(matrix.size, { widthRatio: 0.95, aspect: 1 })
    expect(decode(matrix, greedy)).not.toBe(SHARE_URL)
  })

  it('keeps the required quiet zone of blank paper', () => {
    const { data, width } = rasterize(matrix, band, { scale: 4 })
    const isWhite = (x, y) => data[(y * width + x) * 4] === 255
    const margin = QUIET_ZONE * 4
    for (let i = 0; i < width; i++) {
      expect(isWhite(i, margin - 1)).toBe(true)
      expect(isWhite(margin - 1, i)).toBe(true)
    }
  })
})

describe('card copy', () => {
  const headlineWidth = () =>
    measureHelvetica(COPY.headline[0], { size: LAYOUT.headline.size, bold: true })
  const hookWidth = () =>
    measureHelvetica(COPY.hook, { size: LAYOUT.hook.size }) +
    LAYOUT.emoji.gap +
    LAYOUT.emoji.size

  it('measures Helvetica against the published advance widths', () => {
    // Space is 278/1000 em and "!" is 278 in the regular face, so two of them
    // at 100pt must come to 55.6pt. Pins the table to the spec rather than to
    // whatever this machine happens to render.
    expect(measureHelvetica(' !', { size: 100 })).toBeCloseTo(55.6, 5)
    // The bold face is wider for "!" (333) but not for space (278).
    expect(measureHelvetica(' !', { size: 100, bold: true })).toBeCloseTo(61.1, 5)
  })

  it('ignores characters it has no width for', () => {
    // The tada emoji is artwork positioned beside the text, not a glyph in it,
    // so it must contribute nothing to the measured run.
    expect(measureHelvetica('a\u{1F389}', { size: 12 })).toBe(measureHelvetica('a', { size: 12 }))
  })

  it('keeps the headline on one line', () => {
    // react-pdf would silently wrap an over-wide line and the SVG would run off
    // the card, so the failure this guards against is invisible until it prints.
    expect(headlineWidth()).toBeLessThan(CONTENT_WIDTH)
  })

  it('keeps the hook and its emoji on one line', () => {
    expect(hookWidth()).toBeLessThan(CONTENT_WIDTH)
  })

  it('has no emoji left in the text runs', () => {
    // PDF's base-14 Helvetica has no emoji glyphs: one in COPY renders as
    // mojibake in the print file.
    for (const line of [...COPY.headline, COPY.hook]) {
      expect(line).toMatch(/^[\x20-\x7E]*$/)
    }
  })
})

describe('path building', () => {
  it('emits drawable geometry for modules and finders', () => {
    expect(modulesPath(matrix, band)).toMatch(/^M[\d.]/)
    expect(findersPath(matrix.size)).toMatch(/^M[\d.]/)
  })

  it('omits every module hidden behind the logo', () => {
    // Drawn modules under a paper-coloured band would show through it.
    const withBand = modulesPath(matrix, band).split('M').length
    const withoutBand = modulesPath(matrix, null).split('M').length
    expect(withBand).toBeLessThan(withoutBand)
  })
})
