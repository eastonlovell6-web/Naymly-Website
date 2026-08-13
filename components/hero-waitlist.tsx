'use client'

import { useActionState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { joinWaitlist } from '@/app/actions'
import { initialWaitlistState, type WaitlistSource } from '@/lib/waitlist-state'
import { GlassButton } from '@/components/ui/glass-button'

type Props = {
  /**
   * Which entry point this instance is, recorded with the signup. Also
   * namespaces the field id, since both instances are on the page at once and
   * two labels pointing at one id would send the second form's clicks to the
   * first form's input.
   */
  source?: WaitlistSource
}

/**
 * The waitlist signup: an email field and the submit button, side by side.
 * Both entry points — the fold and the closing CTA — render this same pair, so
 * the button a visitor sees at the bottom of the page is the button they saw at
 * the top, and both post to the same joinWaitlist action.
 *
 * This replaced an earlier bordered-input-and-solid-pill form, which was
 * deleted once both entry points moved here. The surface was the whole
 * difference between them, so keeping two components meant maintaining two
 * treatments of one control.
 */
export function HeroWaitlist({ source = 'hero' }: Props = {}) {
  const [state, formAction, pending] = useActionState(
    joinWaitlist,
    initialWaitlistState,
  )

  const inputId = `waitlist-email-${source}`
  const statusRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (state.status === 'success') {
      statusRef.current?.focus()
    }
  }, [state.status])

  /*
    The confirmation replaces the form in place. It carries the same vertical
    space the row did — the form is 52px tall and this line is one row of text —
    so the copy under it does not jump when the row is swapped out.
  */
  if (state.status === 'success') {
    return (
      <p
        ref={statusRef}
        role="status"
        tabIndex={-1}
        className="flex h-[52px] items-center text-lede font-medium text-brand-600 outline-none"
      >
        {state.message} We will be in touch.
      </p>
    )
  }

  return (
    <form action={formAction} className="w-full max-w-[560px]">
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <label htmlFor={inputId} className="sr-only">
          Email address
        </label>

        {/*
          The surface is on the wrapper, not the input: it is four layers deep
          and two of them are pseudo-elements, which an <input> cannot carry
          because a replaced element has no ::before to give.
        */}
        <div
          className="glass-field min-w-0 flex-1 rounded-full"
          data-invalid={state.status === 'invalid'}
        >
          <input
            id={inputId}
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state.email}
            placeholder="you@example.com"
            aria-invalid={state.status === 'invalid'}
            aria-describedby={state.message ? `${inputId}-message` : undefined}
            /*
              py-3.5 and text-base, which is what the button's default size
              carries — the two boxes have to come out at the same 52px or the
              row reads as misaligned rather than as a pair.

              Transparent and outline-none: the glass under it draws the field,
              and the focus ring belongs to that surface via focus-within.
              relative lifts the text above the wrapper's sheen.
            */
            className="relative block w-full rounded-full bg-transparent px-6 py-3.5 text-base text-neutral-900
              outline-none placeholder:text-neutral-600 sm:text-center sm:placeholder:text-center"
          />
        </div>

        {/*
          Honeypot. Hidden from people and assistive tech, visible to bots.
          Named "website" rather than "company": link-spam bots actively want to
          fill a website field, whereas "company" is the most-guessed honeypot
          name there is and commodity tooling already skips it. The name is
          mirrored by HONEYPOT_FIELD in app/actions.ts.
        */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute left-[-9999px] h-px w-px opacity-0"
        />

        <input type="hidden" name="source" value={source} />

        {/*
          size default rather than the wide box this button carried when it was
          the only object on the row. wide exists to buy back the width a
          removed second button left behind; the field beside it now more than
          covers that, and a px-16 pill next to a flexible input would take the
          row past the width of the supporting line above it.
        */}
        <GlassButton
          type="submit"
          disabled={pending}
          className="glass-blue shrink-0 max-sm:w-full"
          contentClassName="whitespace-nowrap text-center"
        >
          {pending ? 'Joining' : 'Join the waitlist'}
        </GlassButton>
      </div>

      {state.message ? (
        <p
          id={`${inputId}-message`}
          role="alert"
          className="mt-3 text-sm font-medium text-coral-700"
        >
          {state.message}
        </p>
      ) : null}

      {/*
        Lives here rather than in the two callers so both entry points carry the
        same disclosure and cannot drift apart. Inside the form, and therefore
        below the success early-return: once someone has joined there is nothing
        left to disclose before they act.
      */}
      <p className="mt-3 text-sm text-neutral-500">
        Your address is only used to tell you when Naymly launches. Ask us to delete it any
        time.{' '}
        <Link
          href="/privacy"
          className="rounded underline underline-offset-4 transition hover:text-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50"
        >
          Privacy
        </Link>
      </p>
    </form>
  )
}
