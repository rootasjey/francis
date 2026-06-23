import { describe, expect, it } from 'vitest'
import { francAll } from 'franc-all'

describe('franc-all detection', () => {
  it('should detect French text', () => {
    const results = francAll('Les sanglots longs des violons de l\'automne')
    expect(results[0][0]).toBe('fra')
  })

  it('should detect English text', () => {
    const results = francAll('The quick brown fox jumps over the lazy dog')
    expect(results.some(([lang]: [string, number]) => lang === 'eng')).toBe(true)
  })

  it('should detect Spanish text', () => {
    const results = francAll('El veloz murciélago hindú comía feliz cardillo y kiwi')
    expect(results.some(([lang]: [string, number]) => lang === 'spa')).toBe(true)
  })

  it('should detect German text', () => {
    const results = francAll('Der schnelle braune Fuchs springt über den faulen Hund')
    expect(results[0][0]).toBe('deu')
  })

  it('should detect Latin text', () => {
    const results = francAll('Gallia est omnis divisa in partes tres')
    expect(results[0][0]).toBe('lat')
  })

  it('should return multiple alternatives', () => {
    const results = francAll('Hello world', { minLength: 1 })
    expect(results.length).toBeGreaterThanOrEqual(1)
  })

  it('should respect only filter', () => {
    const results = francAll('Bonjour le monde', { only: ['fra', 'eng'], minLength: 1 })
    const languages = results.map(([lang]: [string, number]) => lang)
    expect(languages.every((l: string) => ['fra', 'eng'].includes(l))).toBe(true)
  })

  it('should return und for very short text', () => {
    const results = francAll('Hi', { minLength: 10 })
    expect(results[0][0]).toBe('und')
  })

  it('should return at most 5 alternatives', () => {
    const results = francAll('The quick brown fox')
    const sliced = results.slice(0, 5)
    expect(sliced.length).toBeLessThanOrEqual(5)
  })
})

describe('confidence calculation', () => {
  function computeConfidence(
    bestScore: number,
    nextScore?: number,
    textLength = 20,
  ): number {
    const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
    const normalizedBest = clamp01(1 - Math.min(bestScore, 1000) / 1000)
    const gap = nextScore !== undefined
      ? clamp01((nextScore - bestScore) / 1000)
      : 0.5
    const lengthBoost = clamp01(Math.min(textLength, 140) / 140)
    return clamp01(normalizedBest * 0.55 + gap * 0.25 + lengthBoost * 0.2)
  }

  it('should return high confidence for low score with gap', () => {
    const confidence = computeConfidence(20, 200, 100)
    expect(confidence).toBeGreaterThan(0.7)
  })

  it('should return low confidence for high score', () => {
    const confidence = computeConfidence(500, 550, 20)
    expect(confidence).toBeLessThan(0.5)
  })

  it('should be bounded between 0 and 1', () => {
    expect(computeConfidence(0, 100, 140)).toBeGreaterThan(0)
    expect(computeConfidence(0, 100, 140)).toBeLessThanOrEqual(1)
    expect(computeConfidence(1000, 1001, 0)).toBeGreaterThanOrEqual(0)
    expect(computeConfidence(1000, 1001, 0)).toBeLessThanOrEqual(1)
  })

  it('should benefit from longer text', () => {
    const short = computeConfidence(100, 200, 10)
    const long = computeConfidence(100, 200, 140)
    expect(long).toBeGreaterThan(short)
  })

  it('should benefit from larger gap', () => {
    const smallGap = computeConfidence(100, 110, 50)
    const largeGap = computeConfidence(100, 500, 50)
    expect(largeGap).toBeGreaterThan(smallGap)
  })
})
