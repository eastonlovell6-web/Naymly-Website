# Naymly Website — Design Spec

**Date:** 2026-08-05
**Status:** Approved
**Repo:** https://github.com/eastonlovell6-web/Naymly-Website
**Domain:** naymly.com

---

## 1. Context

Naymly (formerly Namelock) is a pre-launch iOS app that helps people remember the names
of people they meet. It captures who you met in about 20 seconds right after the
conversation, then delivers a brief 15 minutes before you next see that person.

The app has not been built. Four independent validation reports confirm the problem is
real and that no competitor combines fast capture with context-triggered recall. The
product spec, validation research, and go-to-market plan live in the author's Obsidian
vault (`Projects/namelock.md` and `wiki/analyses/namelock-build-master-reference.md`).

This spec covers the **marketing website only**. It is a pre-launch waitlist page.

### Why a waitlist page and not a full marketing site

The app does not exist. A multi-page marketing site would need to make claims about
features that have not been built. A single page that states the problem, explains the
mechanism, and collects an email is honest about the current stage and is the fastest
thing to put behind a purchased domain.

### What success looks like

1. A visitor understands what Naymly does within 10 seconds of landing.
2. A meaningful share of visitors submit an email.
3. The link previews well when shared on LinkedIn, which is the author's primary channel.
4. The page can absorb product screenshots later without a redesign.

---

## 2. Scope

### In scope

- Single-page site at naymly.com
- Six sections: nav, hero, the gap, how it works, privacy, closing CTA + footer
- Email capture writing to Supabase
- Type-based Naymly wordmark
- Full design token system derived from the brand color reference
- OG image and metadata for link sharing
- Deployment to Vercel with the custom domain

### Out of scope

- Pricing of any kind
- Launch dates or timing claims
- Blog, about page, careers, or any additional route
- Product screenshots (a slot is reserved; the content comes later)
- Analytics beyond Vercel's built-in
- Any claim about a feature that does not exist
- Anything relating to the iOS app itself

---

## 3. Page structure

One route: `/`. Six sections top to bottom.

### 3.1 Nav

Sticky, minimal, transparent over the hero and gaining a background on scroll.

- Left: Naymly wordmark
- Right: "Join the waitlist" button that smooth-scrolls to the closing CTA

No other navigation items. There is nowhere else to go.

### 3.2 Hero

Typographic. No product imagery in this iteration.

Copy:

```
Never blank on a name again.

Naymly captures who you met in 20 seconds, then hands you their face,
their role, and the one thing you talked about, 15 minutes before you
see them next.

[ your@email.com ]  [ Join the waitlist ]
```

The email capture is inline and above the fold. This is the primary conversion point.

**Visual treatment:** large headline in neutral-900, subhead in neutral-500, set against
a neutral-50 field with a subtle brand-blue gradient wash. A restrained ambient element
sits behind the type: names rendering faintly and fading out, evoking the forgetting the
product solves. It must be decorative and low-motion, never competing with the headline,
and must respect `prefers-reduced-motion`.

**Hero visual slot:** the ambient element is rendered by a single self-contained
component (`components/hero-visual.tsx`) occupying a fixed region of the hero grid. When
product mockups exist, that component is swapped and nothing else changes. This
constraint is the reason for the component boundary and must be preserved.

### 3.3 The gap

The tension, stated once and briefly. Establishes that this is a real recurring problem
rather than a personal failing, which matters because the target user reads name
forgetting as a character flaw.

Content: a short headline plus two to three sentences of body. The argument is that
forgetting a name is an encoding failure, not a sign that you did not care. The name was
never encoded in the first place.

Visual treatment: type only, centered, on a neutral-100 field to separate it from the
hero above and the cards below. No illustration, no icon, no statistic. The section earns
its place through the sentence, and adding decoration to it would dilute the one idea it
carries.

### 3.4 How it works

Three cards, left to right, representing the full product loop.

| Step | Headline | Body |
|------|----------|------|
| 1 | Capture after the handshake | Step away, speak one sentence. Twenty seconds, and never while they are standing in front of you. |
| 2 | It holds the context | Their role, where you met, the one detail worth remembering. |
| 3 | The brief arrives before you do | Fifteen minutes before your next meeting: their face, their role, one thing you talked about. |

Step 3 is the differentiator and should carry the most visual weight. Coral accents the
"brief arriving" moment, consistent with coral's role in the brand system as the color
of pings and reminders.

### 3.5 Privacy

Naymly stores photos and personal details about third parties. Validation research found
that privacy handled poorly causes immediate churn, and that enterprise adoption is
gated on it. On a waitlist page this is a conversion blocker, not a footnote.

Three claims, stated plainly:

- Photo processing happens on your device
- The AI receives text, never the photo
- One tap deletes everything, locally and in the cloud

These are commitments the product spec already makes. Do not add claims beyond these
three.

### 3.6 Closing CTA and footer

Second email capture, visually stronger than the hero's, on a brand-blue field.

Footer: wordmark, copyright, and a mailto contact link. No social icons until the
accounts exist.

---

## 4. Copy rules

These are hard constraints derived from user research. Violating them was the failure
mode of competing products.

### Never appears anywhere on the site

- "quiz" or "quiz yourself"
- "flashcard"
- "spaced repetition"
- "train your memory" or "memory training"

These evoke academic pressure. Every research participant rejected this framing.

### Never appears in any site copy

- Em dashes. Use commas, periods, or restructure the sentence.

### Tone

Direct and professional with warmth. Not clinical, not playful. The reader is a working
professional who finds this problem genuinely embarrassing. Do not be cute about it.

---

## 5. Design system

### 5.1 Tokens

All tokens live in `app/tokens.css` as CSS custom properties, mapped into Tailwind v4 via
`@theme`. Single source of truth.

The single-file constraint exists so these values port directly into NativeWind when the
iOS app is built. Do not scatter hex values across components.

**Blue (primary, trust and integrity)**

| Step | Hex |
|------|-----|
| 100 | `#E2EBFD` |
| 200 | `#C3D4F9` |
| 300 | `#95B0EC` |
| 400 | `#6689DA` |
| **500 (brand)** | **`#4167C9`** |
| 600 | `#2E50A9` |
| 700 | `#1C3883` |

**Coral (energy, pings and reminders)**

| Step | Hex |
|------|-----|
| 100 | `#FADFD6` |
| 300 | `#F2A58E` |
| 500 | `#E56B49` |
| 700 | `#A84023` |

**Gold (warmth, delight)**

| Step | Hex |
|------|-----|
| 100 | `#F7EED4` |
| 300 | `#E7D397` |
| 500 | `#DABB58` |
| 700 | `#A18131` |

**Neutral**

| Step | Hex |
|------|-----|
| 50 | `#F6F5F2` |
| 100 | `#EDEBE7` |
| 200 | `#DDDAD5` |
| 300 | `#C0BDB7` |
| 400 | `#928F88` |
| 500 | `#6C6862` |
| 600 | `#4A4741` |
| 700 | `#302D28` |
| 800 | `#1D1A16` |
| 900 | `#0F0D0A` |

### 5.2 Color usage rules

- Blue 500 is the primary brand color: wordmark, links, the closing CTA field
- Coral 500 is the action color: primary buttons, the "brief arriving" accent
- Gold is used sparingly for warmth accents only, never for interactive elements
- Neutrals carry all body text and surfaces
- The neutral ramp is warm, not gray. Do not substitute Tailwind's default neutrals.

### 5.3 Typography

**Plus Jakarta Sans** for everything, loaded via `next/font/google` with the subset
limited to Latin. Chosen for continuity with the existing Figma prototype so the site and
the eventual app share a typeface.

Scale: a headline that dominates the hero, a clearly subordinate subhead, and a single
body size. Do not introduce more than four distinct sizes on the page.

### 5.4 Wordmark

Type-based. "Naymly" set in Plus Jakarta Sans, weight 700, tightened tracking, in blue
500. Rendered by a single `components/wordmark.tsx` component so a designed logo replaces
it in one place. The favicon and OG image derive from the same treatment.

### 5.5 Layout and responsiveness

Mobile-first. The audience discovers this link on a phone, most likely from LinkedIn.
Every section must be fully legible and the email capture fully usable at 375px wide
before any desktop refinement is considered.

Max content width around 1100px on desktop, generously padded.

### 5.6 Accessibility

- All text meets WCAG AA contrast against its background
- The email input has a real, associated label, visually hidden if needed
- Focus states are visible on every interactive element and are not removed
- All motion respects `prefers-reduced-motion`
- The page is fully operable by keyboard

Note: coral 500 (`#E56B49`) on white does not meet AA for normal-size text. Use coral as
a background with white or neutral-900 text on top, or restrict it to large text and
non-text accents. Verify during implementation.

---

## 6. Waitlist mechanics

### 6.1 Data model

Supabase Postgres, table `waitlist`:

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | primary key, default `gen_random_uuid()` |
| `email` | text | **unique**, not null, stored lowercased and trimmed |
| `source` | text | which capture form submitted, `hero` or `footer` |
| `referrer` | text | nullable, the HTTP referrer if present |
| `created_at` | timestamptz | default `now()` |

Row-level security is **enabled with no policies**, so the anon key cannot read or write
this table at all. All writes go through the server using the service role key.

### 6.2 Submission flow

A Next.js Server Action handles submission. The service role key is read from the server
environment and never reaches the browser.

1. Validate the email with Zod. Trim and lowercase before validating.
2. Check the honeypot field. If filled, return success without writing anything.
3. Insert into `waitlist`.
4. Return a typed result to the client.

### 6.3 Behaviors that must be implemented exactly

| Case | Behavior |
|------|----------|
| Valid new email | Insert, return success, replace the form with a confirmation message |
| **Duplicate email** | **Return success, identical to the new-email case.** Never reveal that an address is already on the list. |
| Invalid email format | Inline field error, keep the typed value, do not clear the input |
| Honeypot filled | Return success, write nothing |
| Supabase unreachable or errors | Show a real error message, **keep the typed email in the input**, allow retry |
| Submission in flight | Disable the button, show a pending state, prevent double submission |

The duplicate-as-success rule is a privacy requirement, not a convenience. A waitlist that
discloses membership leaks who is interested in the product.

### 6.4 Anti-spam

A honeypot field only. No captcha and no third-party anti-bot script. Rationale: a
pre-launch waitlist for an unlaunched product is a low-value spam target, and a captcha
measurably reduces conversion. If spam appears in practice, revisit then.

### 6.5 Environment variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | **server only** | Waitlist inserts |

`.env.local` is gitignored. `.env.example` is committed with the variable names and no
values. The service role key must never be prefixed `NEXT_PUBLIC_`.

---

## 7. Technical stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15, App Router |
| Language | TypeScript, strict mode |
| Styling | Tailwind CSS v4 |
| Fonts | `next/font/google`, Plus Jakarta Sans |
| Validation | Zod |
| Database | Supabase Postgres |
| Hosting | Vercel |
| Testing | Vitest |

### 7.1 File layout

```
app/
  layout.tsx           metadata, font loading, root shell
  page.tsx             composes the six sections
  tokens.css           all design tokens, single source of truth
  globals.css          Tailwind entry, base styles
  actions.ts           the waitlist server action
  opengraph-image.tsx  generated OG image
components/
  wordmark.tsx         swap point for a designed logo
  nav.tsx
  hero.tsx
  hero-visual.tsx      swap point for product mockups
  gap.tsx
  how-it-works.tsx
  privacy.tsx
  closing-cta.tsx
  footer.tsx
  waitlist-form.tsx    used by both hero and closing CTA
lib/
  supabase.ts          server-side client
  validation.ts        email schema
docs/superpowers/specs/
```

Each section is its own component. `waitlist-form.tsx` is shared by both capture points
and takes a `source` prop so submissions record where they came from.

### 7.2 Deployment

Vercel project connected to the GitHub repo, deploying `main`. naymly.com and
www.naymly.com both configured, with www redirecting to the apex. Environment variables
set in the Vercel dashboard for production.

---

## 8. Testing

Deliberately light. This is a static marketing page with one form.

**Unit tests (Vitest):**

- Email validation: accepts valid addresses, rejects malformed ones, trims and lowercases
- The server action, all five paths: new email, duplicate email, invalid email, honeypot
  filled, Supabase error. Supabase is mocked.

**Manual verification before launch:**

- The page renders correctly at 375px, 768px, and 1440px
- A real submission lands in the Supabase table
- The OG image renders correctly in LinkedIn's post inspector
- Keyboard-only navigation reaches and operates the form

**Gate:** `npm run build` succeeds and all unit tests pass.

No end-to-end tests. The surface does not justify the maintenance.

---

## 9. Open items

None blocking implementation.

Deferred, tracked outside this spec:

- Product mockups for the hero visual slot, once app screens exist
- A designed logo to replace the type-based wordmark
- The Obsidian vault still refers to the product as "Namelock" throughout. A rename pass
  across `Projects/namelock.md`, `wiki/analyses/namelock-build-master-reference.md`, and
  four validation source pages is pending the author's approval.
