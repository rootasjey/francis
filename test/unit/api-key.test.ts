import { describe, expect, it } from 'vitest'
import { generateApiKey, hashKey, keyPrefix, normalizeKey } from '../../server/utils/api-key'

describe('api-key utilities', () => {
  describe('generateApiKey', () => {
    it('should return a key starting with fcs_', () => {
      const key = generateApiKey()
      expect(key.startsWith('fcs_')).toBe(true)
    })

    it('should return a key of the correct length', () => {
      const key = generateApiKey()
      expect(key.length).toBe(4 + 64)
    })

    it('should generate unique keys each time', () => {
      const key1 = generateApiKey()
      const key2 = generateApiKey()
      expect(key1).not.toBe(key2)
    })
  })

  describe('hashKey', () => {
    it('should produce a SHA-256 hex string', async () => {
      const hash = await hashKey('test-key')
      expect(hash).toMatch(/^[0-9a-f]{64}$/)
    })

    it('should produce consistent hashes for same input', async () => {
      const hash1 = await hashKey('same-key')
      const hash2 = await hashKey('same-key')
      expect(hash1).toBe(hash2)
    })

    it('should produce different hashes for different inputs', async () => {
      const hash1 = await hashKey('key-a')
      const hash2 = await hashKey('key-b')
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('keyPrefix', () => {
    it('should return first 7 characters', () => {
      const prefix = keyPrefix('fcs_abcdef1234567890')
      expect(prefix).toBe('fcs_abc')
    })
  })

  describe('normalizeKey', () => {
    it('should trim whitespace', () => {
      expect(normalizeKey('  fcs_key  ')).toBe('fcs_key')
    })

    it('should strip Bearer prefix', () => {
      expect(normalizeKey('Bearer fcs_key')).toBe('fcs_key')
    })

    it('should strip bearer prefix (lowercase)', () => {
      expect(normalizeKey('bearer fcs_key')).toBe('fcs_key')
    })

    it('should return null for empty input', () => {
      expect(normalizeKey('')).toBeNull()
    })

    it('should return null for null input', () => {
      expect(normalizeKey(null)).toBeNull()
    })

    it('should return null for whitespace-only input', () => {
      expect(normalizeKey('   ')).toBeNull()
    })
  })
})
