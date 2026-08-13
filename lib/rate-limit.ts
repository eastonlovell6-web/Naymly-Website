import 'server-only'

import { createHash } from 'node:crypto'
import { getSupabaseAdmin } from '@/lib/supabase'

/**
 * Five signups an hour from one address. A person joining the waitlist does it
 * once; the headroom is for shared egress IPs (an office, a phone carrier's
 * NAT) where several genuine visitors look like one caller.
 */
export const WAITLIST_RATE_LIMIT = 5
export const WAITLIST_RATE_WINDOW_SECONDS = 60 * 60

/**
 * Salted SHA-256 of a visitor address.
 *
 * The salt matters: an unsalted hash of an IPv4 address is trivially reversed,
 * since the whole space is only four billion entries. With a secret salt the
 * stored value is useful for grouping requests and useless for identifying
 * anyone, which is the only property the limiter needs.
 *
 * Pure and takes the salt as an argument so it can be tested without touching
 * the environment.
 */
export function hashIp(ip: string, salt: string): string {
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex')
}

/**
 * Records an attempt and reports whether the caller is under the limit.
 *
 * Fails OPEN everywhere: an unknown address, a missing salt, a database error,
 * a thrown client. The failure mode of a broken limiter should be accepting
 * spam, never silently dropping real signups, because a dropped signup is
 * invisible to both sides and unrecoverable.
 */
export async function allowWaitlistAttempt(ip: string | null): Promise<boolean> {
  if (!ip) return true

  const salt = process.env.WAITLIST_IP_SALT
  if (!salt) {
    // Loud, because the alternative is rate limiting that quietly does nothing.
    console.warn('[waitlist] WAITLIST_IP_SALT is not set. Rate limiting is disabled.')
    return true
  }

  try {
    const { data, error } = await getSupabaseAdmin().rpc('record_waitlist_attempt', {
      p_ip_hash: hashIp(ip, salt),
      p_limit: WAITLIST_RATE_LIMIT,
      p_window_seconds: WAITLIST_RATE_WINDOW_SECONDS,
    })

    if (error) {
      console.warn('[waitlist] rate limiter unavailable, allowing:', error.message)
      return true
    }

    return data !== false
  } catch {
    return true
  }
}
