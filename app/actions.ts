'use server'

import { headers } from 'next/headers'
import { submitWaitlistEntry } from '@/lib/waitlist'
import type { WaitlistSource, WaitlistState } from '@/lib/waitlist-state'

/**
 * The honeypot field's name, shared with the form components.
 *
 * Deliberately not "company": that is the most common honeypot name in
 * existence and commodity spam tooling already skips it. "website" is a field
 * link-spam bots actively want to fill, which turns the trap from something
 * they avoid into something they reach for.
 */
const HONEYPOT_FIELD = 'website'

/**
 * Best-effort caller address, used only for rate limiting and never stored.
 *
 * x-real-ip first: Vercel sets it to the single true client address. The
 * leftmost x-forwarded-for entry is the fallback for other hosts. Both are
 * proxy-supplied, so this is a spam-throttling signal, not an identity.
 */
function callerIp(headerList: Headers): string | null {
  const realIp = headerList.get('x-real-ip')
  if (realIp) return realIp.trim()

  const forwarded = headerList.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }

  return null
}

/**
 * A 'use server' module may only export async functions, which is why the
 * WaitlistState type and its initial value live in lib/waitlist-state.ts.
 */
export async function joinWaitlist(
  _prev: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  const email = String(formData.get('email') ?? '')
  const rawSource = String(formData.get('source') ?? 'hero')
  const source: WaitlistSource = rawSource === 'footer' ? 'footer' : 'hero'
  const honeypot = String(formData.get(HONEYPOT_FIELD) ?? '')

  // headers() returns a Promise in Next.js 15.
  const headerList = await headers()
  const referrer = headerList.get('referer')
  const ip = callerIp(headerList)

  const result = await submitWaitlistEntry({ email, source, referrer, honeypot, ip })

  if (result.status === 'success') {
    return { status: 'success', message: 'You are on the list.', email: '' }
  }

  // The typed address is echoed back so a failed submission never wipes the
  // visitor's input.
  return { status: result.status, message: result.message, email }
}
