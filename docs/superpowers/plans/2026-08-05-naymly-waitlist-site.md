# Naymly Waitlist Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a single-page pre-launch waitlist site for Naymly at naymly.com, collecting emails into Supabase.

**Architecture:** A Next.js 15 App Router site with one route. Six presentational section components compose the page. Email capture is a shared client component wired to a Server Action, which delegates to a plain, unit-tested function in `lib/` so business logic is testable without Next's runtime. All design tokens live in one CSS file so they can later port into NativeWind for the iOS app.

**Tech Stack:** Next.js 15, React 19, TypeScript (strict), Tailwind CSS v4, Zod 3, Supabase Postgres, Vitest, Vercel.

**Spec:** `docs/superpowers/specs/2026-08-05-naymly-website-design.md`

## Phases

The work splits in two because the Supabase project and the contact address do not exist yet.

**Phase 1, Tasks 1 to 11. The design build.** Produces the complete, finished-looking site running locally. The capture form has its real markup, real validation, and all of its visual states. Submissions are accepted and validated but not stored.

**Phase 2, Tasks 12 to 14. Persistence and launch.** Adds the Supabase table and the real submission path, then deploys to naymly.com.

> **Do not deploy anything from Phase 1 to a public URL.** The Phase 1 action tells visitors they are on the list and stores nothing. A live site that quietly discards signups is worse than no site. Phase 2 Task 13 is the gate that makes deployment safe.

Phase 2 has two prerequisites Easton needs to supply:
1. A Supabase project, created at supabase.com. Free tier is sufficient.
2. A working contact address for the footer. Either `hello@naymly.com` set up as forwarding at the registrar, or a different address to use instead.

## Global Constraints

These apply to every task. Re-read them before writing any copy or component.

**Banned words. These must never appear anywhere in site copy, comments, or metadata:**
- "quiz" / "quiz yourself"
- "flashcard"
- "spaced repetition"
- "train your memory" / "memory training"

**Banned punctuation in site copy:** em dashes (`—`). Use commas, periods, or restructure the sentence. This applies to all user-visible text including metadata and the OG image.

**Never state on the site:** pricing, launch dates, or any claim about a feature that does not exist.

**Duplicate emails return success**, identical to a new signup. Never disclose that an address is already on the list.

**`SUPABASE_SERVICE_ROLE_KEY` must never be prefixed `NEXT_PUBLIC_`** and must never be imported into a client component's module graph.

**Exact brand tokens** (copied from the spec, do not approximate):

| Ramp | Values |
|---|---|
| Blue | 100 `#E2EBFD` · 200 `#C3D4F9` · 300 `#95B0EC` · 400 `#6689DA` · **500 `#4167C9`** · 600 `#2E50A9` · 700 `#1C3883` |
| Coral | 100 `#FADFD6` · 300 `#F2A58E` · 500 `#E56B49` · 700 `#A84023` |
| Gold | 100 `#F7EED4` · 300 `#E7D397` · 500 `#DABB58` · 700 `#A18131` |
| Neutral | 50 `#F6F5F2` · 100 `#EDEBE7` · 200 `#DDDAD5` · 300 `#C0BDB7` · 400 `#928F88` · 500 `#6C6862` · 600 `#4A4741` · 700 `#302D28` · 800 `#1D1A16` · 900 `#0F0D0A` |

**Color usage:** blue 500 is the brand color (wordmark, links, closing CTA field). Coral 500 is the action color (primary buttons, "brief arriving" accent). Gold is warmth accents only, never interactive. Coral 500 fails WCAG AA against white for normal-size text, so coral may only be used as a background under white/neutral-900 text, or for large text and non-text accents.

**Typeface:** Plus Jakarta Sans, loaded via `next/font/google`, Latin subset only. No more than four distinct type sizes on the page.

**Mobile-first.** Every section must be legible and the form fully usable at 375px before any desktop refinement.

**Commits:** do not add a `Co-Authored-By` trailer.

---

## File Structure

| File | Phase | Responsibility |
|---|---|---|
| `app/layout.tsx` | 1 | Root shell, font loading, metadata |
| `app/page.tsx` | 1 | Composes the six sections. No logic. |
| `app/tokens.css` | 1 | Every design token. Single source of truth. |
| `app/globals.css` | 1 | Tailwind entry, base element styles |
| `app/actions.ts` | 1, rewritten in 2 | Thin `'use server'` wrapper. No business logic. |
| `app/opengraph-image.tsx` | 1 | Generated share card |
| `app/icon.tsx` | 1 | Generated favicon |
| `lib/validation.ts` | 1 | Email schema. Pure, no I/O. |
| `lib/waitlist-state.ts` | 1 | Form state types shared by client and server. No imports of server-only code. |
| `components/wordmark.tsx` | 1 | Swap point for a designed logo |
| `components/nav.tsx` | 1 | Scroll-reactive sticky header |
| `components/hero.tsx` | 1 | Hero layout and copy |
| `components/hero-visual.tsx` | 1 | **Swap point for product mockups.** Self-contained, fixed region. |
| `components/gap.tsx` | 1 | "The gap" section |
| `components/how-it-works.tsx` | 1 | Three-step section |
| `components/privacy.tsx` | 1 | Privacy commitments |
| `components/closing-cta.tsx` | 1 | Second capture on a blue field |
| `components/footer.tsx` | 1 | Wordmark, copyright, contact |
| `components/waitlist-form.tsx` | 1 | Client form, shared by hero and closing CTA |
| `lib/waitlist.ts` | 2 | `submitWaitlistEntry`. All waitlist business logic. Unit tested. |
| `lib/supabase.ts` | 2 | Server-only Supabase admin client factory |
| `supabase/migrations/0001_waitlist.sql` | 2 | Table and RLS |
| `tests/*.test.ts` | 1 and 2 | Vitest unit tests |

`lib/waitlist.ts` exists as a separate module from `app/actions.ts` specifically so its behavioral paths can be unit tested without Next's server-action runtime. Do not move that logic into the action.

`lib/waitlist-state.ts` is separate from `lib/waitlist.ts` specifically so the client form can import state types without pulling `@supabase/supabase-js` into the client bundle. Do not merge them.

`components/waitlist-form.tsx` is written once in Phase 1 and is **not touched in Phase 2**. The `joinWaitlist` signature is final from Task 3 onward, so swapping the stub for the real implementation changes nothing on the client.

---

# PHASE 1: THE DESIGN BUILD

---

### Task 1: Project scaffold, design tokens, and test harness

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `vitest.config.ts`, `.gitignore`, `.env.example`
- Create: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `app/tokens.css`

**Interfaces:**
- Consumes: nothing
- Produces: the `@/` path alias resolving to the repo root; Tailwind utilities `bg-brand-500`, `text-coral-500`, `bg-gold-500`, `bg-neutral-50` through `bg-neutral-900`, and the `font-sans` family bound to Plus Jakarta Sans via the `--font-jakarta` CSS variable.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "naymly-website",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.45.0",
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0",
    "@types/node": "^22.10.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.0",
    "vitest": "^2.1.0"
  }
}
```

Zod is pinned to `^3` deliberately. Zod 4 moved `.email()` to a top-level `z.email()`, and the code in Task 2 uses the v3 chained form.

`@supabase/supabase-js` is installed now even though nothing imports it until Phase 2, so that the dependency set does not change mid-build.

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create `next.config.ts` and `postcss.config.mjs`**

`next.config.ts`:

```typescript
import type { NextConfig } from 'next'
import path from 'node:path'

const nextConfig: NextConfig = {
  // An unrelated package-lock.json in an ancestor directory otherwise makes
  // Next infer the wrong workspace root and warn on every build.
  outputFileTracingRoot: path.resolve(__dirname),
}

export default nextConfig
```

There is deliberately no `lint` script and no ESLint dependency. `next lint` is
deprecated in Next 15, and nothing in this project runs it. TypeScript strict
mode plus the production build are the gates.

`postcss.config.mjs`:

```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

- [ ] **Step 4: Create `.gitignore` and `.env.example`**

`.gitignore`:

```
node_modules/
.next/
out/
build/
.DS_Store
*.pem
.env
.env.local
.env*.local
.vercel
next-env.d.ts
coverage/
*.tsbuildinfo

# Local agent tooling state, not project source
.claude-flow/
```

`.env.example`:

```
# Phase 2 only. Not required for the Phase 1 design build.

# Supabase project URL. Safe to expose to the browser.
NEXT_PUBLIC_SUPABASE_URL=

# Service role key. SERVER ONLY. Never prefix this with NEXT_PUBLIC_.
SUPABASE_SERVICE_ROLE_KEY=
```

- [ ] **Step 5: Create `app/tokens.css` with the full token set**

```css
@theme {
  /* Clear Tailwind's cool default neutrals so only the warm ramp below exists. */
  --color-neutral-*: initial;

  --color-neutral-50: #F6F5F2;
  --color-neutral-100: #EDEBE7;
  --color-neutral-200: #DDDAD5;
  --color-neutral-300: #C0BDB7;
  --color-neutral-400: #928F88;
  --color-neutral-500: #6C6862;
  --color-neutral-600: #4A4741;
  --color-neutral-700: #302D28;
  --color-neutral-800: #1D1A16;
  --color-neutral-900: #0F0D0A;

  --color-brand-100: #E2EBFD;
  --color-brand-200: #C3D4F9;
  --color-brand-300: #95B0EC;
  --color-brand-400: #6689DA;
  --color-brand-500: #4167C9;
  --color-brand-600: #2E50A9;
  --color-brand-700: #1C3883;

  --color-coral-100: #FADFD6;
  --color-coral-300: #F2A58E;
  --color-coral-500: #E56B49;
  --color-coral-700: #A84023;

  --color-gold-100: #F7EED4;
  --color-gold-300: #E7D397;
  --color-gold-500: #DABB58;
  --color-gold-700: #A18131;

  --font-sans: var(--font-jakarta), ui-sans-serif, system-ui, sans-serif;
}
```

These are the only hex values allowed in the codebase, with the single exception of `app/opengraph-image.tsx` and `app/icon.tsx` in Task 10, which run through Satori and cannot read CSS variables. Every component references them through Tailwind utilities.

- [ ] **Step 6: Create `app/globals.css`**

```css
@import "tailwindcss";
@import "./tokens.css";

html {
  scroll-behavior: smooth;
}

body {
  background-color: var(--color-neutral-50);
  color: var(--color-neutral-900);
  -webkit-font-smoothing: antialiased;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 7: Create `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Naymly',
  description: 'Never blank on a name again.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
```

Full metadata comes in Task 10. This is the minimum needed to render.

- [ ] **Step 8: Create a temporary `app/page.tsx` to prove the tokens work**

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold text-brand-500">Naymly</h1>
      <div className="flex gap-2">
        <div className="h-10 w-10 rounded bg-brand-500" />
        <div className="h-10 w-10 rounded bg-coral-500" />
        <div className="h-10 w-10 rounded bg-gold-500" />
        <div className="h-10 w-10 rounded bg-neutral-900" />
      </div>
    </main>
  )
}
```

This file is replaced in Task 9.

- [ ] **Step 9: Create `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
```

The environment is `node`, not `jsdom`, because only `lib/` modules are unit tested. There are no component tests.

- [ ] **Step 10: Install and verify**

Run: `npm install`
Then run: `npm run build`
Expected: build succeeds.

Then run: `npm run dev` and open http://localhost:3000
Expected: "Naymly" renders in blue with four color swatches beneath it, in Plus Jakarta Sans. If the swatches are the wrong colors, the token file is not being picked up. If the type is not Jakarta, the font variable is not reaching `body`.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 15 app with Naymly design tokens

Tailwind v4 CSS-first config. All brand tokens in app/tokens.css as the
single source of truth so they can port into NativeWind later. Vitest
configured for lib/ unit tests only."
```

---

### Task 2: Email validation module

**Files:**
- Create: `lib/validation.ts`
- Test: `tests/validation.test.ts`

**Interfaces:**
- Consumes: the `@/` alias from Task 1
- Produces: `emailSchema`, a Zod schema whose `.safeParse(input)` returns `{ success: true, data: string }` with the email trimmed and lowercased, or `{ success: false, error }` where `error.issues[0].message` is a user-facing sentence.

This lands in Phase 1 because it has no Supabase dependency, and it is what makes the form's error state real rather than mocked.

- [ ] **Step 1: Write the failing test**

Create `tests/validation.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { emailSchema } from '@/lib/validation'

describe('emailSchema', () => {
  it('accepts a valid address', () => {
    const result = emailSchema.safeParse('easton@example.com')
    expect(result.success).toBe(true)
  })

  it('trims surrounding whitespace', () => {
    const result = emailSchema.safeParse('  easton@example.com  ')
    expect(result.success).toBe(true)
    if (result.success) expect(result.data).toBe('easton@example.com')
  })

  it('lowercases the address', () => {
    const result = emailSchema.safeParse('Easton@Example.COM')
    expect(result.success).toBe(true)
    if (result.success) expect(result.data).toBe('easton@example.com')
  })

  it('rejects an empty string with a prompt to enter one', () => {
    const result = emailSchema.safeParse('')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Enter your email address.')
    }
  })

  it('rejects whitespace-only input', () => {
    const result = emailSchema.safeParse('   ')
    expect(result.success).toBe(false)
  })

  it('rejects a malformed address', () => {
    const result = emailSchema.safeParse('not-an-email')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'That does not look like a valid email address.',
      )
    }
  })

  it('rejects an address with no domain', () => {
    expect(emailSchema.safeParse('easton@').success).toBe(false)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL, cannot resolve `@/lib/validation`.

- [ ] **Step 3: Write the implementation**

Create `lib/validation.ts`:

```typescript
import { z } from 'zod'

/**
 * Email schema for waitlist signup. Trims and lowercases before validating so
 * that "  Easton@Example.COM " and "easton@example.com" collide on the unique
 * index rather than creating two rows.
 */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, { message: 'Enter your email address.' })
  .email({ message: 'That does not look like a valid email address.' })
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test`
Expected: PASS, 7 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/validation.ts tests/validation.test.ts
git commit -m "feat: add email validation schema

Normalizes case and whitespace before validating so equivalent addresses
collide on the unique index instead of creating duplicate rows."
```

---

### Task 3: Waitlist form and its stubbed action

**Files:**
- Create: `lib/waitlist-state.ts`, `app/actions.ts`, `components/waitlist-form.tsx`

**Interfaces:**
- Consumes: `emailSchema` from `@/lib/validation`
- Produces:
  - `type WaitlistSource = 'hero' | 'footer'` from `@/lib/waitlist-state`
  - `type WaitlistState = { status: 'idle' | 'success' | 'invalid' | 'error'; message: string; email: string }` from `@/lib/waitlist-state`
  - `initialWaitlistState: WaitlistState` from `@/lib/waitlist-state`
  - `joinWaitlist(prev: WaitlistState, formData: FormData): Promise<WaitlistState>` from `@/app/actions`
  - `<WaitlistForm source={...} variant={...} />` from `@/components/waitlist-form`, where `source: WaitlistSource` and `variant?: 'light' | 'dark'` defaulting to `'light'`

**This task's `joinWaitlist` validates but does not store.** Its signature is final. Phase 2 Task 13 replaces the body and nothing else.

- [ ] **Step 1: Create the shared state module**

Create `lib/waitlist-state.ts`:

```typescript
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
```

- [ ] **Step 2: Create the stubbed server action**

Create `app/actions.ts`:

```typescript
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
```

- [ ] **Step 3: Create the form component**

Create `components/waitlist-form.tsx`:

```tsx
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
                ? 'border-brand-300 bg-white/95 text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-white focus-visible:ring-offset-brand-500'
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
```

White text on coral 500 is used here rather than coral text on white, because coral 500 fails AA as normal-size text on a light background.

- [ ] **Step 4: Wire the form into the temporary page and verify every state**

Replace the body of `app/page.tsx` with:

```tsx
import { WaitlistForm } from '@/components/waitlist-form'

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <WaitlistForm source="hero" />
    </main>
  )
}
```

Run: `npm run dev`

Verify each by hand:

1. Submit `not-an-email`. Expected: "That does not look like a valid email address." appears below the field, the field shows `aria-invalid`, and the typed text stays put.
2. Submit an empty field. Expected: "Enter your email address."
3. Submit a valid address. Expected: the form is replaced by "You are on the list. We will be in touch." and the terminal shows the `[waitlist] STUB` warning.
4. While the request is in flight the button reads "Joining" and is disabled. This is fast locally, so throttle the network in DevTools to see it.
5. Test the dark variant by temporarily setting `variant="dark"` and wrapping the main in `className="bg-brand-500"`. Confirm the input, button, and error text are all legible. Revert afterward.

- [ ] **Step 5: Run the test suite**

Run: `npm test`
Expected: PASS, 7 tests.

- [ ] **Step 6: Commit**

```bash
git add lib/waitlist-state.ts app/actions.ts components/waitlist-form.tsx app/page.tsx
git commit -m "feat: add waitlist capture form with a stubbed action

One form component serves both capture points, tagged by source. Validation
is real; persistence lands in Phase 2. The action signature is final, so the
form does not change when Supabase is wired in."
```

---

### Task 4: Wordmark and scroll-reactive nav

**Files:**
- Create: `components/wordmark.tsx`, `components/nav.tsx`

**Interfaces:**
- Consumes: nothing beyond tokens
- Produces: `<Wordmark />` accepting `{ className?: string }`, and `<Nav />` taking no props

- [ ] **Step 1: Create the wordmark**

Create `components/wordmark.tsx`:

```tsx
/**
 * The only place the Naymly wordmark is rendered. When a designed logo
 * exists, replace the contents of this component and nothing else changes.
 */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`text-xl font-extrabold tracking-tight text-brand-500 ${className}`}>
      Naymly
    </span>
  )
}
```

- [ ] **Step 2: Create the nav**

Create `components/nav.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { Wordmark } from '@/components/wordmark'

/**
 * Transparent while the visitor is at the top of the hero, gaining a surface
 * once they scroll past it. A client component because it needs the scroll
 * position.
 */
export function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)

    // Run once on mount so a reload partway down the page starts in the
    // correct state rather than flashing transparent.
    onScroll()

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-200 ${
        scrolled
          ? 'border-b border-neutral-200/70 bg-neutral-50/85 backdrop-blur'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-5 sm:px-8"
      >
        {/*
          aria-label overrides the name derived from content. Without it, the
          accessible name concatenates the wordmark's visible "Naymly" with any
          sr-only text, announcing the word twice.
        */}
        <a
          href="#top"
          aria-label="Naymly, back to top"
          className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          <Wordmark />
        </a>

        <a
          href="#waitlist"
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition
            hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          Join the waitlist
        </a>
      </nav>
    </header>
  )
}
```

The listener is registered `passive: true` so it never blocks scrolling. The transition is a color change only, so the global reduced-motion rule from Task 1 shortens it without breaking the state change.

`useEffect` runs after the browser paints, so reloading the page while already
scrolled shows the transparent state for roughly one frame before the surface
appears. `useLayoutEffect` would close that gap, and it is deliberately not used:
it warns during server rendering and would need an isomorphic wrapper, which is
not worth it for one frame on the rare path of reloading mid-scroll. Landing at
the top of the page, which is what nearly every visitor does, renders correctly
on first paint because transparent is already the right state there.

- [ ] **Step 3: Verify**

Temporarily render `<Nav />` above the form in `app/page.tsx`. The page needs enough height to scroll, so add `<div className="h-[200vh]" />` beneath the form for this check and remove it afterward.

Run: `npm run dev`

Confirm each:
1. At the top of the page, the header has no background or border and the content shows through behind it.
2. After scrolling roughly 25px, a translucent blurred surface and a bottom border fade in.
3. Scrolling back to the top removes them again.
4. Reloading while scrolled partway down starts with the surface already present, with no transparent flash.
5. The wordmark is brand blue and tabbing reaches both links with a visible focus ring.

- [ ] **Step 4: Commit**

```bash
git add components/wordmark.tsx components/nav.tsx app/page.tsx
git commit -m "feat: add wordmark and scroll-reactive sticky nav

Transparent over the hero, gaining a surface past 24px of scroll. Wordmark
is isolated in one component so a designed logo replaces it in a single
place."
```

---

### Task 5: Hero and hero visual

**Files:**
- Create: `components/hero.tsx`, `components/hero-visual.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `<WaitlistForm />` from Task 3
- Produces: `<Hero />` and `<HeroVisual />`, both taking no props. `<Hero />` renders the `#top` anchor targeted by the nav wordmark.

- [ ] **Step 1: Create the hero visual**

Create `components/hero-visual.tsx`:

```tsx
const NAMES = [
  'Marcus', 'Priya', 'Sofia', 'Daniel', 'Amara', 'Jonas',
  'Leila', 'Tomás', 'Grace', 'Hiroshi', 'Nadia', 'Owen',
]

/**
 * SWAP POINT. This component owns the hero's visual region and nothing else
 * depends on its internals. When product screenshots exist, replace the body
 * of this component with the mockup. The layout around it does not change.
 *
 * Today it renders names fading out, evoking the forgetting the product
 * solves. Purely decorative, so it is hidden from assistive tech.
 */
export function HeroVisual() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-brand-100/70 via-neutral-50 to-neutral-50" />

      {NAMES.map((name, i) => (
        <span
          key={name}
          className="absolute font-semibold text-brand-400/45 motion-safe:animate-[nameFade_9s_ease-in-out_infinite]"
          style={{
            left: `${(i * 37 + 9) % 88}%`,
            top: `${(i * 53 + 12) % 82}%`,
            fontSize: `${0.85 + ((i * 7) % 5) * 0.22}rem`,
            animationDelay: `${(i * 0.75) % 9}s`,
          }}
        >
          {name}
        </span>
      ))}

      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-neutral-50 to-transparent" />
    </div>
  )
}
```

- [ ] **Step 2: Add the keyframes to `app/globals.css`**

Append to `app/globals.css`:

```css
@keyframes nameFade {
  0%, 100% { opacity: 0; }
  18% { opacity: 1; }
  55% { opacity: 1; }
  82% { opacity: 0; }
}
```

The `motion-safe:` prefix on the animation plus the global reduced-motion block in Task 1 means the names render static for anyone who has asked for less motion.

- [ ] **Step 3: Create the hero**

Create `components/hero.tsx`:

```tsx
import { WaitlistForm } from '@/components/waitlist-form'
import { HeroVisual } from '@/components/hero-visual'

export function Hero() {
  return (
    {/*
      scroll-mt-16 matters: Nav is sticky and in flow at h-16, so this section's
      offsetTop is 64px. Without the scroll margin, navigating to #top lands at
      scrollY 64, which is above the nav's own "scrolled" threshold of 24, so
      clicking "back to top" would leave the header in its opaque state instead
      of the transparent one it shows on a fresh load.
    */}
    <section id="top" className="relative isolate overflow-hidden scroll-mt-16">
      <HeroVisual />

      <div className="relative mx-auto max-w-[1100px] px-5 py-24 sm:px-8 sm:py-32">
        <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-neutral-900 sm:text-6xl">
          Never blank on a name again.
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-600 sm:text-xl">
          Naymly captures who you met in 20 seconds, then hands you their face,
          their role, and the one thing you talked about, 15 minutes before you
          see them next.
        </p>

        <div className="mt-10">
          <WaitlistForm source="hero" />
        </div>

        <p className="mt-4 text-sm text-neutral-500">
          Coming to iOS. Join the waitlist and you will hear from us first.
        </p>
      </div>
    </section>
  )
}
```

Copy check before moving on: no banned words, no em dashes, no price, no date.

- [ ] **Step 4: Verify**

Temporarily render `<Nav />` then `<Hero />` in `app/page.tsx`.

Run: `npm run dev`
Expected at 375px wide: the headline wraps without overflowing, the email input and button stack vertically, and the faint names sit behind the text without reducing its legibility. Enable "Reduce motion" in macOS System Settings, reload, and confirm the names hold still.

- [ ] **Step 5: Commit**

```bash
git add components/hero.tsx components/hero-visual.tsx app/globals.css app/page.tsx
git commit -m "feat: add typographic hero with ambient name-fade visual

HeroVisual is a self-contained swap point so product mockups can replace it
later without touching the hero layout."
```

---

### Task 6: The gap section

**Files:**
- Create: `components/gap.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: `<Gap />` taking no props

- [ ] **Step 1: Create the component**

Create `components/gap.tsx`:

```tsx
export function Gap() {
  return (
    <section className="bg-neutral-100 px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-4xl">
          Forgetting a name is not a character flaw.
        </h2>

        <p className="mt-6 text-lg leading-relaxed text-neutral-600">
          You met forty people this quarter. You can name six of them. That is
          not because you did not care. It is because the name never got encoded
          in the first place. It arrived in the middle of a handshake, competing
          with everything else you were tracking, and it was gone before the
          conversation ended.
        </p>
      </div>
    </section>
  )
}
```

Type only, on neutral-100, centered. No illustration, no icon, no statistic block. The section earns its place through the sentence, and decoration would dilute the one idea it carries.

- [ ] **Step 2: Verify**

Render `<Gap />` beneath the hero in `app/page.tsx`.

Run: `npm run dev`
Expected: the neutral-100 field visibly separates this from the hero above, and the paragraph stays comfortably readable at 375px.

- [ ] **Step 3: Commit**

```bash
git add components/gap.tsx app/page.tsx
git commit -m "feat: add the gap section

Reframes name forgetting as an encoding failure rather than a personal
failing, which is the objection that blocks the target user from acting."
```

---

### Task 7: How it works

**Files:**
- Create: `components/how-it-works.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: `<HowItWorks />` taking no props

- [ ] **Step 1: Create the component**

Create `components/how-it-works.tsx`:

```tsx
const STEPS = [
  {
    n: '01',
    title: 'Capture after the handshake',
    body:
      'Step away, speak one sentence. Twenty seconds, and never while they are standing in front of you.',
    accent: false,
  },
  {
    n: '02',
    title: 'It holds the context',
    body:
      'Their role, where you met, and the one detail worth remembering. Nothing you have to organize later.',
    accent: false,
  },
  {
    n: '03',
    title: 'The brief arrives before you do',
    body:
      'Fifteen minutes before your next meeting: their face, their role, and one thing you talked about.',
    accent: true,
  },
]

export function HowItWorks() {
  return (
    <section className="px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[1100px]">
        <h2 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-4xl">
          Two moments, and nothing in between.
        </h2>

        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <li
              key={step.n}
              className={`rounded-2xl border p-8 ${
                step.accent
                  ? 'border-coral-300 bg-coral-100'
                  : 'border-neutral-200 bg-white'
              }`}
            >
              <span
                className={`text-sm font-bold tracking-widest ${
                  step.accent ? 'text-coral-700' : 'text-brand-500'
                }`}
              >
                {step.n}
              </span>

              <h3 className="mt-4 text-xl font-bold leading-snug text-neutral-900">
                {step.title}
              </h3>

              <p className="mt-3 leading-relaxed text-neutral-600">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
```

Step three carries the visual weight because the brief is the differentiator. Coral 700 on coral 100 is used for the step number rather than coral 500 on white, which would fail contrast.

- [ ] **Step 2: Verify**

Render `<HowItWorks />` beneath `<Gap />`.

Run: `npm run dev`
Expected: three cards side by side at desktop width, stacking into one column below 768px, with the third card visibly warmer than the first two.

- [ ] **Step 3: Commit**

```bash
git add components/how-it-works.tsx app/page.tsx
git commit -m "feat: add how-it-works section

Three cards carrying the full product loop, with the pre-meeting brief
weighted heaviest since it is the differentiator."
```

---

### Task 8: Privacy

**Files:**
- Create: `components/privacy.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: `<Privacy />` taking no props

- [ ] **Step 1: Create the component**

Create `components/privacy.tsx`:

```tsx
const COMMITMENTS = [
  {
    title: 'Photos are processed on your device',
    body: 'Faces never leave your phone to be recognized.',
  },
  {
    title: 'The AI reads text, never photos',
    body: 'Only the name and the context you captured are ever sent for processing.',
  },
  {
    title: 'One tap deletes everything',
    body: 'On your phone and in the cloud, together, with nothing left behind.',
  },
]

export function Privacy() {
  return (
    <section className="bg-neutral-100 px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[1100px]">
        <h2 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-4xl">
          You are keeping notes about real people. That deserves care.
        </h2>

        <ul className="mt-12 grid gap-8 sm:grid-cols-3">
          {COMMITMENTS.map((item) => (
            <li key={item.title}>
              <div className="h-1 w-10 rounded-full bg-gold-500" />
              <h3 className="mt-5 text-lg font-bold leading-snug text-neutral-900">
                {item.title}
              </h3>
              <p className="mt-2 leading-relaxed text-neutral-600">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
```

Exactly three claims, all of which the product spec already commits to. Do not add a fourth. Gold appears here as a non-interactive warmth accent, which is its only permitted role.

- [ ] **Step 2: Verify**

Render `<Privacy />` beneath `<HowItWorks />`.

Run: `npm run dev`
Expected: three columns at desktop, stacking below 640px, with a small gold rule above each heading.

- [ ] **Step 3: Commit**

```bash
git add components/privacy.tsx app/page.tsx
git commit -m "feat: add privacy section

Three commitments the product spec already makes. Privacy is a conversion
blocker for an app that stores photos and notes about third parties, not a
footnote."
```

---

### Task 9: Closing CTA, footer, and page composition

**Files:**
- Create: `components/closing-cta.tsx`, `components/footer.tsx`
- Modify: `app/page.tsx` (full replacement)

**Interfaces:**
- Consumes: every section component from Tasks 4 through 8, `<WaitlistForm />` from Task 3
- Produces: the finished `/` route. `<ClosingCta />` renders the `#waitlist` anchor targeted by the nav button.

- [ ] **Step 1: Create the closing CTA**

Create `components/closing-cta.tsx`:

```tsx
import { WaitlistForm } from '@/components/waitlist-form'

export function ClosingCta() {
  return (
    <section id="waitlist" className="bg-brand-500 px-5 py-24 sm:px-8 sm:py-28">
      <div className="mx-auto flex max-w-[1100px] flex-col items-center text-center">
        <h2 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
          Be there when it ships.
        </h2>

        <p className="mt-5 max-w-lg text-lg leading-relaxed text-brand-100">
          Naymly is coming to iOS. Join the waitlist and you will hear from us
          before anyone else.
        </p>

        <div className="mt-10 flex justify-center">
          <WaitlistForm source="footer" variant="dark" />
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create the footer**

Create `components/footer.tsx`:

```tsx
import { Wordmark } from '@/components/wordmark'

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-4 sm:flex-row">
        <Wordmark className="text-base" />

        <div className="flex items-center gap-6 text-sm text-neutral-500">
          <a
            href="mailto:hello@naymly.com"
            className="rounded transition hover:text-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            hello@naymly.com
          </a>
          <span>&copy; {new Date().getFullYear()} Naymly</span>
        </div>
      </div>
    </footer>
  )
}
```

`hello@naymly.com` does not exist yet. That is acceptable for the Phase 1 design build, but Phase 2 Task 14 blocks on either setting up registrar forwarding or substituting a working address. A dead contact link on a live site is worse than none.

- [ ] **Step 3: Replace `app/page.tsx` with the full composition**

```tsx
import { Nav } from '@/components/nav'
import { Hero } from '@/components/hero'
import { Gap } from '@/components/gap'
import { HowItWorks } from '@/components/how-it-works'
import { Privacy } from '@/components/privacy'
import { ClosingCta } from '@/components/closing-cta'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Gap />
        <HowItWorks />
        <Privacy />
        <ClosingCta />
      </main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 4: Verify the whole page**

Run: `npm run dev`

Check each:
1. Clicking "Join the waitlist" in the nav scrolls to the closing CTA.
2. Both forms accept a valid address and show the success message independently of each other.
3. Section backgrounds alternate: hero on neutral-50, gap on neutral-100, how-it-works on neutral-50, privacy on neutral-100, closing CTA on brand-500.
4. The dark form variant is legible against the blue field.
5. The nav is transparent over the hero and gains its surface once you scroll into the gap section.

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add components/closing-cta.tsx components/footer.tsx app/page.tsx
git commit -m "feat: add closing CTA and footer, compose the full page

Both capture points are tagged by source so hero and footer conversion can
be compared once persistence lands."
```

---

### Task 10: Metadata, OG image, and favicon

**Files:**
- Modify: `app/layout.tsx`
- Create: `app/opengraph-image.tsx`, `app/icon.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: complete Open Graph and Twitter card metadata, a generated 1200x630 share image at `/opengraph-image`, and a generated favicon

- [ ] **Step 1: Replace the metadata export in `app/layout.tsx`**

Replace the existing `metadata` const with:

```typescript
export const metadata: Metadata = {
  metadataBase: new URL('https://naymly.com'),
  title: 'Naymly | Never blank on a name again',
  description:
    'Naymly captures who you met in 20 seconds, then hands you their face, their role, and the one thing you talked about, 15 minutes before you see them next.',
  openGraph: {
    title: 'Naymly | Never blank on a name again',
    description:
      'Capture who you met in 20 seconds. Get the brief 15 minutes before you see them next.',
    url: 'https://naymly.com',
    siteName: 'Naymly',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Naymly | Never blank on a name again',
    description:
      'Capture who you met in 20 seconds. Get the brief 15 minutes before you see them next.',
  },
  robots: { index: true, follow: true },
}
```

Copy check: no banned words, no em dashes, no price, no date.

- [ ] **Step 2: Create the OG image**

Create `app/opengraph-image.tsx`:

```tsx
import { ImageResponse } from 'next/og'

export const alt = 'Naymly. Never blank on a name again.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          backgroundColor: '#4167C9',
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: '#C3D4F9',
            letterSpacing: '-0.02em',
          }}
        >
          Naymly
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 82,
            fontWeight: 800,
            color: '#FFFFFF',
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            maxWidth: 900,
          }}
        >
          Never blank on a name again.
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 30,
            color: '#C3D4F9',
            maxWidth: 820,
            lineHeight: 1.4,
          }}
        >
          Capture who you met in 20 seconds. Get the brief 15 minutes before you
          see them next.
        </div>
      </div>
    ),
    size,
  )
}
```

This deliberately uses `ImageResponse`'s built-in font rather than Plus Jakarta Sans. Loading a custom font here requires committing a font binary and fetching it at render time, which is a failure mode this page does not need. The brand blue field and the layout carry the identity. Swapping in the real typeface is a later refinement, not a blocker.

Hex values are inlined here because Satori renders this outside the browser and cannot read CSS variables. These must stay in sync with `app/tokens.css` by hand.

- [ ] **Step 3: Create the favicon**

Create `app/icon.tsx`:

```tsx
import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#4167C9',
          borderRadius: 7,
          color: '#FFFFFF',
          fontSize: 22,
          fontWeight: 800,
        }}
      >
        N
      </div>
    ),
    size,
  )
}
```

- [ ] **Step 4: Verify**

Run: `npm run dev`

1. Open http://localhost:3000/opengraph-image. Expected: a 1200x630 blue card with the headline, no clipped text.
2. Open http://localhost:3000/icon. Expected: a small blue rounded square with a white N.
3. View source on the homepage and confirm `og:title`, `og:description`, and `og:image` are present.

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx app/opengraph-image.tsx app/icon.tsx
git commit -m "feat: add metadata, OG share image, and favicon

The OG card matters because LinkedIn is the primary distribution channel
for this link."
```

---

### Task 11: Accessibility and responsive pass

**Files:**
- Modify: whichever components fail the checks below

**Interfaces:**
- Consumes: the finished page from Tasks 9 and 10
- Produces: no new interfaces. This task only fixes defects.

This is the end of Phase 1. After this task the site is visually complete and ready for review.

- [ ] **Step 1: Run the keyboard check**

Run: `npm run dev`

Load the page, then press Tab repeatedly from the top without touching the mouse.

Expected order: wordmark link, nav CTA, hero email input, hero submit, closing-CTA email input, closing-CTA submit, contact link. Every stop must show a visible focus ring. The honeypot must never receive focus.

Fix any element with a missing or invisible focus ring by adding `focus-visible:ring-2 focus-visible:ring-offset-2` plus an appropriate ring color from the token set.

- [ ] **Step 2: Run the contrast check**

Open DevTools, Elements, and inspect each text element. Chrome shows a contrast ratio in the color picker.

Required: at least 4.5:1 for text under 24px, and at least 3:1 for text 24px and above.

Pay particular attention to:
- `text-neutral-500` on `bg-neutral-100`
- `text-brand-100` on `bg-brand-500` in the closing CTA
- `text-coral-700` on `bg-coral-100` in the third how-it-works card
- The error message inside the dark form variant
- **The nav in its transparent state**, where the wordmark and the blue CTA sit directly over the hero's `brand-100` gradient wash rather than over `neutral-50`. Scroll to the very top and check both against the lightest point of that gradient. If either fails, darken the hero gradient's starting opacity rather than changing the nav, since the nav must stay consistent in both states.

If any pair fails, move one step darker or lighter on the same ramp. Do not introduce a hex value outside `app/tokens.css`.

- [ ] **Step 3: Run the responsive check**

In DevTools device toolbar, test at 375px, 768px, and 1440px.

At each width confirm:
- No horizontal scrollbar
- The headline does not overflow or clip
- The email input and its button are both fully reachable and tappable
- Card grids collapse cleanly rather than squeezing
- Nothing overlaps the sticky header

- [ ] **Step 4: Run the reduced-motion check**

Enable Reduce Motion in macOS System Settings under Accessibility, then Display. Reload the page.

Expected: the hero names are static, and anchor navigation jumps instantly rather than smooth-scrolling.

- [ ] **Step 5: Verify the build and tests still pass**

Run: `npm test`
Expected: PASS, 7 tests.

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 6: Commit and push**

```bash
git add -A
git commit -m "fix: accessibility and responsive corrections

Focus rings, contrast, and layout fixes found in the manual pass."
git push -u origin main
```

If no defects were found, skip the commit rather than creating an empty one, but still push.

**Phase 1 is complete.** The site is visually finished and running locally. Do not deploy it. Stop here for Easton's design review.

---

# PHASE 2: PERSISTENCE AND LAUNCH

> Blocked until Easton provides a Supabase project and a working contact address.

---

### Task 12: Supabase client, waitlist table, and submission logic

**Files:**
- Create: `lib/supabase.ts`, `lib/waitlist.ts`, `supabase/migrations/0001_waitlist.sql`
- Test: `tests/waitlist.test.ts`

**Interfaces:**
- Consumes: `emailSchema` from `@/lib/validation`, `WaitlistSource` from `@/lib/waitlist-state`
- Produces:
  - `getSupabaseAdmin(): SupabaseClient` from `@/lib/supabase`
  - `submitWaitlistEntry(input: WaitlistInput): Promise<WaitlistResult>` from `@/lib/waitlist`, where `WaitlistInput = { email: string; source: WaitlistSource; referrer: string | null; honeypot: string }` and `WaitlistResult` is `{ status: 'success' } | { status: 'invalid'; message: string } | { status: 'error'; message: string }`

- [ ] **Step 1: Create the SQL migration**

Create `supabase/migrations/0001_waitlist.sql`:

```sql
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null,
  referrer text,
  created_at timestamptz not null default now()
);

-- RLS is enabled with zero policies, so the anon key can neither read nor
-- write this table. Every insert goes through the server using the service
-- role key, which bypasses RLS. A waitlist that any visitor could read would
-- disclose who is interested in the product.
alter table public.waitlist enable row level security;
```

- [ ] **Step 2: Run the migration against the Supabase project**

Open the Supabase dashboard, go to the SQL Editor, paste the contents of `supabase/migrations/0001_waitlist.sql`, and run it.

Then, still in the dashboard, go to Project Settings, then API, and copy the Project URL and the `service_role` secret key.

Create `.env.local` (which is gitignored) with:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR-SERVICE-ROLE-KEY
```

Verify in the dashboard's Table Editor that `waitlist` exists with a shield icon indicating RLS is enabled.

- [ ] **Step 3: Create the Supabase admin client**

Create `lib/supabase.ts`:

```typescript
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cached: SupabaseClient | null = null

/**
 * Server-only Supabase client using the service role key, which bypasses RLS.
 * Never import this from a client component.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    )
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  return cached
}
```

- [ ] **Step 4: Write the failing test**

Create `tests/waitlist.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

const insert = vi.fn()

vi.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: () => ({ from: () => ({ insert }) }),
}))

import { submitWaitlistEntry } from '@/lib/waitlist'

const base = {
  email: 'easton@example.com',
  source: 'hero' as const,
  referrer: null,
  honeypot: '',
}

beforeEach(() => {
  insert.mockReset()
  insert.mockResolvedValue({ error: null })
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
})
```

- [ ] **Step 5: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL, cannot resolve `@/lib/waitlist`.

- [ ] **Step 6: Write the implementation**

Create `lib/waitlist.ts`:

```typescript
import { emailSchema } from '@/lib/validation'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { WaitlistSource } from '@/lib/waitlist-state'

/** Postgres unique_violation. */
const UNIQUE_VIOLATION = '23505'

const GENERIC_ERROR = 'Something went wrong on our end. Try that again in a moment.'

export type WaitlistInput = {
  email: string
  source: WaitlistSource
  referrer: string | null
  honeypot: string
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

  const parsed = emailSchema.safeParse(input.email)
  if (!parsed.success) {
    return { status: 'invalid', message: parsed.error.issues[0].message }
  }

  try {
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
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS, 17 tests total across both files.

- [ ] **Step 8: Commit**

```bash
git add lib/supabase.ts lib/waitlist.ts supabase/ tests/waitlist.test.ts
git commit -m "feat: add waitlist submission logic and schema

Duplicate emails return success rather than disclosing membership. The
honeypot is checked before validation so bots cannot distinguish the two
rejection paths. RLS is enabled with no policies, so only the service role
can touch the table."
```

---

### Task 13: Replace the stubbed action with the real one

**Files:**
- Modify: `app/actions.ts` (full replacement)

**Interfaces:**
- Consumes: `submitWaitlistEntry` from `@/lib/waitlist`
- Produces: no signature change. `joinWaitlist` keeps the exact contract established in Task 3.

`components/waitlist-form.tsx` must not be modified by this task. If it needs changing, the Task 3 interface was wrong and that is the bug to fix.

- [ ] **Step 1: Replace the whole contents of `app/actions.ts`**

```typescript
'use server'

import { headers } from 'next/headers'
import { submitWaitlistEntry } from '@/lib/waitlist'
import type { WaitlistSource, WaitlistState } from '@/lib/waitlist-state'

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
  const honeypot = String(formData.get('company') ?? '')

  const referrer = (await headers()).get('referer')

  const result = await submitWaitlistEntry({ email, source, referrer, honeypot })

  if (result.status === 'success') {
    return { status: 'success', message: 'You are on the list.', email: '' }
  }

  // The typed address is echoed back so a failed submission never wipes the
  // visitor's input.
  return { status: result.status, message: result.message, email }
}
```

`headers()` is awaited because it returns a Promise in Next.js 15.

- [ ] **Step 2: Confirm no stub language survives**

Run: `grep -rn "STUB\|not yet persisted\|without storing" app/ lib/ components/`
Expected: no matches.

- [ ] **Step 3: Verify end to end against the real database**

Run: `npm run dev`

1. Submit a valid address in the hero form. Expected: the success message, and the row appears in the Supabase Table Editor with `source` equal to `hero`.
2. Submit the same address again. Expected: the identical success message, and no second row.
3. Submit from the closing CTA form. Expected: a row with `source` equal to `footer`.
4. Submit `not-an-email`. Expected: the inline error, the typed text preserved, and no row.
5. In DevTools, delete the `left-[-9999px]` class from the honeypot input to reveal it, type anything into it, and submit with a valid email. Expected: the success message, and no new row.
6. Stop your network connection and submit. Expected: an error message, and the typed email still in the field.

- [ ] **Step 4: Run the full suite and build**

Run: `npm test`
Expected: PASS, 17 tests.

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add app/actions.ts
git commit -m "feat: persist waitlist signups to Supabase

Replaces the Phase 1 stub. The action signature is unchanged, so the form
component is untouched."
```

---

### Task 14: Deploy to Vercel with the custom domain

**Files:**
- Modify: `components/footer.tsx`, only if the contact address changes

**Interfaces:**
- Consumes: the finished site
- Produces: naymly.com serving the live site

- [ ] **Step 1: Settle the contact address**

Either set up `hello@naymly.com` as a forwarding address at the registrar, or replace the `mailto:` href and its link text in `components/footer.tsx` with a working address.

Verify by sending a test message to whichever address ends up in the footer and confirming it arrives.

- [ ] **Step 2: Re-check the dependency audit**

Run: `npm audit`

At the time Task 1 was built, this reported 8 advisories (1 critical, 4 high), all
of them dev-toolchain or build-time, with every fix requiring a major bump to
Next 16 or Vitest 4. Easton ruled on 2026-08-05 to defer them through Phase 1
because vitest, vite, and esbuild never ship to production, and the Next
advisories arrive via postcss (build-time) and sharp (image optimization, which
this site does not use).

That ruling covered Phase 1 only. Before going live, re-run the audit and check
whether anything now affects runtime code rather than tooling. If a production
path is implicated, fix it before deploying rather than after.

- [ ] **Step 3: Push to GitHub**

```bash
git push origin main
```

- [ ] **Step 4: Create the Vercel project**

Go to vercel.com, choose Add New, then Project, and import `eastonlovell6-web/Naymly-Website`.

Vercel detects Next.js automatically. Leave build and output settings at their defaults.

- [ ] **Step 5: Set production environment variables**

In the Vercel project, go to Settings, then Environment Variables, and add both for the Production environment:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | the same value as in `.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | the same value as in `.env.local` |

Confirm `SUPABASE_SERVICE_ROLE_KEY` is not marked as exposed to the browser and is not prefixed `NEXT_PUBLIC_`.

- [ ] **Step 6: Deploy and smoke test the Vercel URL**

Trigger the deployment and wait for it to finish.

On the `*.vercel.app` URL, submit a real email. Expected: the success message, and the row appears in the Supabase Table Editor with `source` equal to `hero`.

If the submission fails, the environment variables are almost certainly missing from Production. Check the function logs in the Vercel dashboard.

- [ ] **Step 7: Connect the domain**

In Settings, then Domains, add `naymly.com` and `www.naymly.com`.

Vercel will show the DNS records to create. At your registrar, add them. Configure `www.naymly.com` to redirect to `naymly.com`, which is Vercel's default when you add both.

Wait for DNS to propagate. Vercel issues the TLS certificate automatically once it resolves.

- [ ] **Step 8: Final verification on the live domain**

1. https://naymly.com loads over HTTPS.
2. https://www.naymly.com redirects to the apex.
3. A submission on the live domain writes to Supabase.
4. The footer contact link opens a mail client addressed to a mailbox that actually receives.
5. Paste https://naymly.com into the LinkedIn post composer and confirm the OG card renders with the blue background and the headline. If it shows a stale or missing preview, run the URL through LinkedIn's Post Inspector to refresh their cache.
6. Load the site on a real phone, not just the DevTools emulator.

- [ ] **Step 9: Commit any final configuration changes**

If Step 1 changed the footer, commit it. Otherwise there is nothing to commit and the site is live.

---

## Post-Launch Follow-Ups

Not part of this plan. Tracked here so they are not lost.

- Replace `components/hero-visual.tsx` with product screenshots once app screens exist
- Replace `components/wordmark.tsx` with a designed logo
- Load Plus Jakarta Sans into the OG image
- The Obsidian vault still calls the product "Namelock" throughout `Projects/namelock.md`, `wiki/analyses/namelock-build-master-reference.md`, and four validation source pages. A rename pass is pending Easton's approval.
