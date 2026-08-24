import { describe, it, expect } from 'vitest'
import jsQR from 'jsqr'
import {
  SHARE_URL,
  QUIET_ZONE,
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
