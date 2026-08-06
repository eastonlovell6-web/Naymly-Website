'use client'

import { useActionState } from 'react'
import { joinWaitlist } from '@/app/actions'
import { initialWaitlistState, type WaitlistSource } from '@/lib/waitlist-state'

type Props = {
  source: WaitlistSource
  variant?: 'light' | 'dark'
}

export function WaitlistForm({ source, variant = 'light' }: Props) {
  const [state, formAction, pending] = useActionState(joinWaitlist, initialWaitlistState)

  const inputId = `waitlist-email-${source}`
  const dark = variant === 'dark'

  if (state.status === 'success') {
    return (
      <p
        role="status"
        className={`text-lg font-semibold ${dark ? 'text-white' : 'text-brand-500'}`}
      >
        {state.message} We will be in touch.
      </p>
    )
  }

  return (
    <form action={formAction} className="w-full max-w-md">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor={inputId} className="sr-only">
          Email address
        </label>
        <input
          id={inputId}
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.email}
          placeholder="you@company.com"
          aria-invalid={state.status === 'invalid'}
          aria-describedby={state.message ? `${inputId}-message` : undefined}
          className={`min-w-0 flex-1 rounded-lg border px-4 py-3 text-base outline-none transition
            focus-visible:ring-2 focus-visible:ring-offset-2
            ${
              dark
                ? 'border-brand-300 bg-white/95 text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-white focus-visible:ring-offset-brand-600'
                : 'border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-brand-500 focus-visible:ring-offset-neutral-50'
            }`}
        />

        {/* Honeypot. Hidden from people and assistive tech, visible to bots. */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute left-[-9999px] h-px w-px opacity-0"
        />

        <input type="hidden" name="source" value={source} />

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-coral-500 px-6 py-3 text-base font-semibold text-white transition
            hover:bg-coral-700 focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-coral-700 focus-visible:ring-offset-2 disabled:opacity-70"
        >
          {pending ? 'Joining' : 'Join the waitlist'}
        </button>
      </div>

      {state.message ? (
        <p
          id={`${inputId}-message`}
          role="alert"
          className={`mt-2 text-sm ${dark ? 'text-coral-100' : 'text-coral-700'}`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  )
}
