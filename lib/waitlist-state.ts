/**
 * Shared between the client form and the server action.
 *
 * This module is deliberately separate from lib/waitlist.ts so that the client
 * component can import these types and the initial state without pulling
 * @supabase/supabase-js into the client bundle.
 */

export type WaitlistSource = 'hero' | 'footer'

export type WaitlistState = {
  status: 'idle' | 'success' | 'invalid' | 'error'
  message: string
  email: string
}

export const initialWaitlistState: WaitlistState = {
  status: 'idle',
  message: '',
  email: '',
}
