# Naymly Website

This is the pre-launch marketing site for Naymly (naymly.com).

## Do not deploy this build

This is Phase 1. The waitlist form validates input and reports success to the
visitor, but it does not store anything: submitted addresses are discarded.
Because of that, this build must not be deployed to a public URL. Deploying
it would tell real visitors they are on a waitlist that does not exist.

For the full picture, see `docs/superpowers/specs/` for the design spec and
`docs/superpowers/plans/` for the implementation plan.

## Getting started

```
npm install
npm run dev
npm test
npm run build
```

## No ESLint

There is deliberately no ESLint configuration in this project. TypeScript
strict mode and the production build (`npm run build`) are the quality
gates. Run `npm run typecheck` to check types without building.

## Design tokens

`app/tokens.css` is the single source of truth for color. Any component
should reference the tokens defined there rather than hardcoding colors.

The two exceptions are `app/opengraph-image.tsx` and `app/icon.tsx`, which
are rendered with Satori and hardcode hex values because Satori cannot read
CSS custom properties.

## Copy rules

No em dashes in any user-visible copy, including metadata and the OG image.

Never use the words "quiz", "quiz yourself", "flashcard", "spaced repetition",
"memory training", or "train your memory" anywhere in site copy.

Both phrasings of the memory-training ban are listed on purpose. "Train your
memory" is the exact framing user research rejected most strongly, and a
contributor reading only the noun form could reasonably conclude the verb form
was allowed.
