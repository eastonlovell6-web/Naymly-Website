import 'server-only'

import { emailSchema } from '@/lib/validation'
import { getSupabaseAdmin } from '@/lib/supabase'
import { allowWaitlistAttempt } from '@/lib/rate-limit'
import type { WaitlistSource } from '@/lib/waitlist-state'

/** Postgres unique_violation. */
const UNIQUE_VIOLATION = '23505'

const GENERIC_ERROR = 'Something went wrong on our end. Try that again in a moment.'

export type WaitlistInput = {
  email: string
  source: WaitlistSource
  referrer: string | null
  honeypot: string
  /** Caller address, used only for rate limiting. Never stored on the row. */
  ip: string | null
}

export type WaitlistResult =
  | { status: 'success' }
  | { status: 'invalid'; message: string }
  | { status: 'error'; message: string }

export async function submitWaitlistEntry(input: WaitlistInput): Promise<WaitlistResult> {
  // Checked before validation so a bot cannot distinguish the honeypot path
  // from a normal submission by probing with a malformed address.
  if (input.honeypot.trim() !== '') {
    return { status: 'success' }
  }

  // Validation runs before the rate limiter on purpose. It is pure CPU and
  // rejects without touching the database, so a malformed address costs nothing
  // and should not consume one of the caller's five slots.
  const parsed = emailSchema.safeParse(input.email)
  if (!parsed.success) {
    return { status: 'invalid', message: parsed.error.issues[0].message }
  }

  try {
    // Reported as success, like the honeypot and the duplicate. Every path a
    // bot can drive returns the same response, so probing reveals nothing about
    // which defense caught it.
    if (!(await allowWaitlistAttempt(input.ip))) {
      return { status: 'success' }
    }

    const { error } = await getSupabaseAdmin().from('waitlist').insert({
      email: parsed.data,
      source: input.source,
      referrer: input.referrer,
    })

    if (error) {
      // A duplicate is reported as success. Telling the visitor that their
      // address is already on the list would disclose waitlist membership.
      if (error.code === UNIQUE_VIOLATION) {
        return { status: 'success' }
      }
      return { status: 'error', message: GENERIC_ERROR }
    }

    return { status: 'success' }
  } catch {
    return { status: 'error', message: GENERIC_ERROR }
  }
}
