-- Waitlist signups.
--
-- RLS is enabled with zero policies, so the anon key can neither read nor write
-- this table. Every insert goes through the server using the service role key,
-- which bypasses RLS. A waitlist that any visitor could read would disclose who
-- is interested in the product.

create table if not exists public.waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  source     text not null,
  referrer   text,
  created_at timestamptz not null default now()
);

-- Case-insensitive uniqueness rather than a plain `unique` on email.
-- lib/validation.ts already trims and lowercases before this table ever sees
-- the address, so this index is the belt to that suspenders: it holds even if
-- a future caller skips the schema.
create unique index if not exists waitlist_email_lower_idx
  on public.waitlist (lower(email));

alter table public.waitlist enable row level security;

-- Explicit, because the project was created with "automatically expose new
-- tables" off. Without this the service role cannot see the table either.
-- No grants to anon or authenticated: nothing in the browser touches Supabase.
grant select, insert on table public.waitlist to service_role;
