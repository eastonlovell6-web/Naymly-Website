/**
 * Vitest stand-in for the `server-only` package.
 *
 * That package throws on import outside a React Server Component graph, which
 * is exactly what makes it useful: a client component importing lib/waitlist.ts
 * becomes a build error rather than a silently larger bundle. Vitest is neither
 * environment, so vitest.config.ts aliases the package to this empty module.
 *
 * The guard it replaces is enforced by `next build`, not by the test run, so
 * stubbing it here costs nothing.
 */
export {}
