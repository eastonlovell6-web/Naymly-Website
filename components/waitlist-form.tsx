'use client'

import { useActionState, useEffect, useRef } from 'react'
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
  const statusRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (state.status === 'success') {
      statusRef.current?.focus()
    }
  }, [state.status])

  if (state.status === 'success') {
    return (
      <p
        ref={statusRef}
        role="status"
        tabIndex={-1}
        className={`text-lede font-medium ${dark ? 'text-white' : 'text-brand-500'}`}
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

        {/*
          A pill rather than the coral block this used to be. The colour is not
          what was wrong with it — a 16px semibold button was simply louder than
          anything else on the page, and docs/DESIGN.md is explicit that the CTA
          should be the quiet element next to the headline, not the loud one.

          `pill-invert` on the dark variant: a near-black pill on the brand-600
          closing band sinks into it instead of sitting on it.
        */}
        <button
          type="submit"
          disabled={pending}
          className={`pill justify-center focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-offset-2
            ${
              dark
                ? 'pill-invert focus-visible:ring-white focus-visible:ring-offset-brand-600'
                : 'focus-visible:ring-neutral-900 focus-visible:ring-offset-neutral-50'
            }`}
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
