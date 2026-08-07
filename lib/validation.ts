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
  .max(254, { message: 'That email address is too long.' })
  .email({ message: 'That does not look like a valid email address.' })
