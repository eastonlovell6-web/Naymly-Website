import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const rpc = vi.fn()

vi.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: () => ({ rpc }),
}))

import {
  hashIp,
  allowWaitlistAttempt,
  WAITLIST_RATE_LIMIT,
  WAITLIST_RATE_WINDOW_SECONDS,
} from '@/lib/rate-limit'

const SALT = 'test-salt'

beforeEach(() => {
  rpc.mockReset()
  rpc.mockResolvedValue({ data: true, error: null })
  process.env.WAITLIST_IP_SALT = SALT
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('hashIp', () => {
  it('is stable for the same address and salt', () => {
    expect(hashIp('203.0.113.7', SALT)).toBe(hashIp('203.0.113.7', SALT))
  })

  it('differs between addresses', () => {
    expect(hashIp('203.0.113.7', SALT)).not.toBe(hashIp('203.0.113.8', SALT))
  })

  it('differs between salts, so the hashes are not a portable rainbow table', () => {
    expect(hashIp('203.0.113.7', SALT)).not.toBe(hashIp('203.0.113.7', 'other-salt'))
  })

  it('does not leak the raw address into the output', () => {
    expect(hashIp('203.0.113.7', SALT)).not.toContain('203.0.113.7')
  })
})

describe('allowWaitlistAttempt', () => {
  it('allows the attempt when the limiter reports room in the window', async () => {
    await expect(allowWaitlistAttempt('203.0.113.7')).resolves.toBe(true)
  })

  it('passes the hashed address and the configured window to the limiter', async () => {
    await allowWaitlistAttempt('203.0.113.7')

    expect(rpc).toHaveBeenCalledWith('record_waitlist_attempt', {
      p_ip_hash: hashIp('203.0.113.7', SALT),
      p_limit: WAITLIST_RATE_LIMIT,
      p_window_seconds: WAITLIST_RATE_WINDOW_SECONDS,
    })
  })

  it('never sends the raw address to the database', async () => {
    await allowWaitlistAttempt('203.0.113.7')

    expect(JSON.stringify(rpc.mock.calls)).not.toContain('203.0.113.7')
  })

  it('denies the attempt when the limiter reports the window is full', async () => {
    rpc.mockResolvedValue({ data: false, error: null })

    await expect(allowWaitlistAttempt('203.0.113.7')).resolves.toBe(false)
  })

  it('fails open when the limiter errors, so an outage cannot block real signups', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'function does not exist' } })

    await expect(allowWaitlistAttempt('203.0.113.7')).resolves.toBe(true)
  })

  it('fails open when the limiter throws', async () => {
    rpc.mockRejectedValue(new Error('network down'))

    await expect(allowWaitlistAttempt('203.0.113.7')).resolves.toBe(true)
  })

  it('fails open without calling the limiter when the address is unknown', async () => {
    await expect(allowWaitlistAttempt(null)).resolves.toBe(true)
    expect(rpc).not.toHaveBeenCalled()
  })

  it('fails open and warns when the salt is not configured', async () => {
    delete process.env.WAITLIST_IP_SALT

    await expect(allowWaitlistAttempt('203.0.113.7')).resolves.toBe(true)
    expect(rpc).not.toHaveBeenCalled()
    expect(console.warn).toHaveBeenCalled()
  })
})
