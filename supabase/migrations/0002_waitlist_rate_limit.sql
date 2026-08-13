-- Rate limiting for the waitlist server action.
--
-- A Server Action is a public POST endpoint, and it writes through the service
-- role key, which bypasses RLS by design. The honeypot alone is not a defense:
-- commodity spam tooling skips hidden fields.
--
-- This lives in Postgres rather than in process memory because the site runs on
-- serverless functions. An in-memory counter is forgotten on every cold start
-- and is not shared between concurrent instances, so it would not actually
-- limit anything.

-- ip_hash is a salted SHA-256 computed in the application, never a raw address.
-- That keeps this table from becoming a log of who visited the site: it can
-- answer "has this bucket been busy" and nothing else.
create table if not exists public.waitlist_attempt (
  id           bigint generated always as identity primary key,
  ip_hash      text not null,
  attempted_at timestamptz not null default now()
);

create index if not exists waitlist_attempt_lookup_idx
  on public.waitlist_attempt (ip_hash, attempted_at desc);

alter table public.waitlist_attempt enable row level security;

-- Counts recent attempts for a bucket and records this one, atomically.
-- Returns true when the caller is under the limit and false when it is not.
--
-- security definer so it runs as the owner: the service role is granted execute
-- on this function and nothing at all on the table underneath, so the only way
-- to reach the attempt log is through this one gate.
create or replace function public.record_waitlist_attempt(
  p_ip_hash        text,
  p_limit          int,
  p_window_seconds int
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  recent_count int;
begin
  select count(*) into recent_count
    from public.waitlist_attempt
   where ip_hash = p_ip_hash
     and attempted_at > now() - make_interval(secs => p_window_seconds);

  if recent_count >= p_limit then
    return false;
  end if;

  insert into public.waitlist_attempt (ip_hash) values (p_ip_hash);

  -- Opportunistic cleanup keeps the table bounded without needing pg_cron.
  -- Roughly one call in a hundred pays for it; rows older than a day cannot
  -- affect any window this function is asked about.
  if random() < 0.01 then
    delete from public.waitlist_attempt
     where attempted_at < now() - interval '24 hours';
  end if;

  return true;
end;
$$;

-- Postgres grants execute on new functions to PUBLIC by default. Revoke that
-- before granting, or anon could call the limiter directly and flood the log.
revoke execute on function public.record_waitlist_attempt(text, int, int) from public;
revoke execute on function public.record_waitlist_attempt(text, int, int) from anon, authenticated;
grant  execute on function public.record_waitlist_attempt(text, int, int) to service_role;
