import { describe, it, expect } from 'vitest'
import { emailSchema } from '@/lib/validation'

describe('emailSchema', () => {
  it('accepts a valid address', () => {
    const result = emailSchema.safeParse('easton@example.com')
    expect(result.success).toBe(true)
  })

  it('trims surrounding whitespace', () => {
    const result = emailSchema.safeParse('  easton@example.com  ')
    expect(result.success).toBe(true)
    if (result.success) expect(result.data).toBe('easton@example.com')
  })

  it('lowercases the address', () => {
    const result = emailSchema.safeParse('Easton@Example.COM')
    expect(result.success).toBe(true)
    if (result.success) expect(result.data).toBe('easton@example.com')
  })

  it('rejects an empty string with a prompt to enter one', () => {
    const result = emailSchema.safeParse('')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Enter your email address.')
    }
  })

  it('rejects whitespace-only input', () => {
    const result = emailSchema.safeParse('   ')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Enter your email address.')
    }
  })

  it('rejects an address longer than 254 characters', () => {
    const longLocalPart = 'a'.repeat(250)
    const longAddress = `${longLocalPart}@example.com`
    const result = emailSchema.safeParse(longAddress)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('That email address is too long.')
    }
  })

  it('rejects a malformed address', () => {
    const result = emailSchema.safeParse('not-an-email')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'That does not look like a valid email address.',
      )
    }
  })

  it('rejects an address with no domain', () => {
    expect(emailSchema.safeParse('easton@').success).toBe(false)
  })
})
