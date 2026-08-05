'use server'

import { emailSchema } from '@/lib/validation'
import type { WaitlistState } from '@/lib/waitlist-state'

/**
 * PHASE 1 STUB. Validates the submission and reports success WITHOUT STORING
 * ANYTHING. Replaced in Phase 2 Task 13 once a Supabase project exists.
 *
 * Do not deploy this to a public URL. It tells visitors they are on the list
 * and then discards the address.
 *
 * A 'use server' module may only export async functions, which is why
 * WaitlistState and its initial value live in lib/waitlist-state.ts.
 */
export async function joinWaitlist(
  _prev: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  const email = String(formData.get('email') ?? '')
  const honeypot = String(formData.get('company') ?? '')

  if (honeypot.trim() !== '') {
    return { status: 'success', message: 'You are on the list.', email: '' }
  }

  const parsed = emailSchema.safeParse(email)
  if (!parsed.success) {
    // The typed address is echoed back so a failed submission never wipes the
    // visitor's input.
    return { status: 'invalid', message: parsed.error.issues[0].message, email }
  }

  console.warn(`[waitlist] STUB accepted ${parsed.data} without storing it`)

  return { status: 'success', message: 'You are on the list.', email: '' }
}
