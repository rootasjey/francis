import { describe, expect, it } from 'vitest'
import { hashPassword, verifyPassword } from '../../server/utils/password'

describe('hashPassword', () => {
  it('should return a string with pbkdf2 prefix', async () => {
    const hash = await hashPassword('test-password', 1000)
    expect(hash.startsWith('pbkdf2$')).toBe(true)
  })

  it('should embed iteration count in the hash', async () => {
    const hash = await hashPassword('test', 5000)
    expect(hash.startsWith('pbkdf2$5000$')).toBe(true)
  })

  it('should produce different hashes for the same password (different salt)', async () => {
    const [hash1, hash2] = await Promise.all([
      hashPassword('same-password', 1000),
      hashPassword('same-password', 1000),
    ])
    expect(hash1).not.toBe(hash2)
  })
})

describe('verifyPassword', () => {
  it('should verify a correct password', async () => {
    const hash = await hashPassword('correct-password', 1000)
    await expect(verifyPassword(hash, 'correct-password')).resolves.toBe(true)
  })

  it('should reject an incorrect password', async () => {
    const hash = await hashPassword('real-password', 1000)
    await expect(verifyPassword(hash, 'wrong-password')).resolves.toBe(false)
  })

  it('should return false for malformed hash strings', async () => {
    await expect(verifyPassword('invalid', 'pwd')).resolves.toBe(false)
    await expect(verifyPassword('pbkdf2$a$b', 'pwd')).resolves.toBe(false)
    await expect(verifyPassword('', 'pwd')).resolves.toBe(false)
  })

  it('should return false for hash with wrong prefix', async () => {
    await expect(verifyPassword('bcrypt$10$salt$hash', 'pwd')).resolves.toBe(false)
  })

  it('should use default iterations when not specified', async () => {
    const hash = await hashPassword('test')
    expect(hash.startsWith('pbkdf2$100000$')).toBe(true)
  })
})
