import { describe, it, expect, vi, beforeEach } from 'vitest'

const insert = vi.fn()
const allowWaitlistAttempt = vi.fn()

vi.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: () => ({ from: () => ({ insert }) }),
}))

vi.mock('@/lib/rate-limit', () => ({
  allowWaitlistAttempt: (ip: string | null) => allowWaitlistAttempt(ip),
}))

import { submitWaitlistEntry } from '@/lib/waitlist'

const base = {
  email: 'easton@example.com',
  source: 'hero' as const,
  referrer: null,
  honeypot: '',
  ip: '203.0.113.7',
}

beforeEach(() => {
  insert.mockReset()
  insert.mockResolvedValue({ error: null })
  allowWaitlistAttempt.mockReset()
  allowWaitlistAttempt.mockResolvedValue(true)
})

describe('submitWaitlistEntry', () => {
  it('inserts a new email and reports success', async () => {
    const result = await submitWaitlistEntry(base)

    expect(result).toEqual({ status: 'success' })
    expect(insert).toHaveBeenCalledWith({
      email: 'easton@example.com',
      source: 'hero',
      referrer: null,
    })
  })

  it('normalizes the email before inserting', async () => {
    await submitWaitlistEntry({ ...base, email: '  Easton@Example.COM ' })

    expect(insert).toHaveBeenCalledWith({
      email: 'easton@example.com',
      source: 'hero',
      referrer: null,
    })
  })

  it('records the source and referrer', async () => {
    await submitWaitlistEntry({
      ...base,
      source: 'footer',
      referrer: 'https://www.linkedin.com/',
    })

    expect(insert).toHaveBeenCalledWith({
      email: 'easton@example.com',
      source: 'footer',
      referrer: 'https://www.linkedin.com/',
    })
  })

  it('never writes the visitor IP to the waitlist row', async () => {
    await submitWaitlistEntry(base)

    expect(JSON.stringify(insert.mock.calls)).not.toContain('203.0.113.7')
  })

  it('reports success for a duplicate email without disclosing it exists', async () => {
    insert.mockResolvedValue({
      error: { code: '23505', message: 'duplicate key value violates unique constraint' },
    })

    const result = await submitWaitlistEntry(base)

    expect(result).toEqual({ status: 'success' })
  })

  it('reports invalid for a malformed email and does not insert', async () => {
    const result = await submitWaitlistEntry({ ...base, email: 'not-an-email' })

    expect(result.status).toBe('invalid')
    expect(insert).not.toHaveBeenCalled()
  })

  it('reports invalid for an empty email and does not insert', async () => {
    const result = await submitWaitlistEntry({ ...base, email: '' })

    expect(result.status).toBe('invalid')
    expect(insert).not.toHaveBeenCalled()
  })

  it('silently succeeds when the honeypot is filled and does not insert', async () => {
    const result = await submitWaitlistEntry({ ...base, honeypot: 'Acme Inc' })

    expect(result).toEqual({ status: 'success' })
    expect(insert).not.toHaveBeenCalled()
  })

  it('checks the honeypot before validating, so bots learn nothing from the response', async () => {
    const result = await submitWaitlistEntry({
      ...base,
      email: 'not-an-email',
      honeypot: 'Acme Inc',
    })

    expect(result).toEqual({ status: 'success' })
    expect(insert).not.toHaveBeenCalled()
  })

  it('does not spend a rate-limit slot on a submission the honeypot already caught', async () => {
    await submitWaitlistEntry({ ...base, honeypot: 'Acme Inc' })

    expect(allowWaitlistAttempt).not.toHaveBeenCalled()
  })

  it('does not spend a rate-limit slot on a malformed email, which costs no database write', async () => {
    await submitWaitlistEntry({ ...base, email: 'not-an-email' })

    expect(allowWaitlistAttempt).not.toHaveBeenCalled()
  })

  it('reports success without inserting when the address is rate limited', async () => {
    allowWaitlistAttempt.mockResolvedValue(false)

    const result = await submitWaitlistEntry(base)

    expect(result).toEqual({ status: 'success' })
    expect(insert).not.toHaveBeenCalled()
  })

  it('passes the caller IP to the rate limiter', async () => {
    await submitWaitlistEntry(base)

    expect(allowWaitlistAttempt).toHaveBeenCalledWith('203.0.113.7')
  })

  it('reports an error when the insert fails for any other reason', async () => {
    insert.mockResolvedValue({ error: { code: '08006', message: 'connection failure' } })

    const result = await submitWaitlistEntry(base)

    expect(result.status).toBe('error')
    if (result.status === 'error') {
      expect(result.message.length).toBeGreaterThan(0)
    }
  })

  it('reports an error when the client throws', async () => {
    insert.mockRejectedValue(new Error('network down'))

    const result = await submitWaitlistEntry(base)

    expect(result.status).toBe('error')
  })

  it('reports an error when Supabase is not configured', async () => {
    insert.mockImplementation(() => {
      throw new Error('Supabase is not configured.')
    })

    const result = await submitWaitlistEntry(base)

    expect(result.status).toBe('error')
  })
})
