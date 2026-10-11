-- =============================================================================
-- Migration: Audit fixes (shared rate limiting, progress write access, history
-- privacy, recurring cycle lookups)
-- =============================================================================

-- 1. Shared rate limiting. Server instances on serverless hosting do not share
--    memory, so request counts live here. Only the service role can call it.
create table if not exists public.rate_limit_hits (
  key text not null,
  hit_at timestamp with time zone not null default now()
);

create index if not exists idx_rate_limit_hits_key_time on public.rate_limit_hits(key, hit_at);

alter table public.rate_limit_hits enable row level security;

create or replace function public.check_rate_limit(
  p_key text,
  p_max integer,
  p_window_seconds integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  recent integer;
begin
  -- Serialize checks for the same key so concurrent requests count correctly.
  perform pg_advisory_xact_lock(hashtext(p_key));

  delete from public.rate_limit_hits
  where key = p_key and hit_at < now() - make_interval(secs => p_window_seconds);

  select count(*) into recent from public.rate_limit_hits where key = p_key;
  if recent >= p_max then
    return false;
  end if;

  insert into public.rate_limit_hits(key) values (p_key);
  return true;
end;
$$;

revoke execute on function public.check_rate_limit(text, integer, integer) from public, anon, authenticated;

-- Old hits for keys that are never checked again are cleared daily.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule(
      'wirddy-rate-limit-cleanup',
      '17 3 * * *',
      $cron$delete from public.rate_limit_hits where hit_at < now() - interval '1 day'$cron$
    );
  end if;
exception when others then
  null;
end $$;

-- 2. Reading progress is written only by the server, which checks who may
--    change a member's progress. The public key could previously insert and
--    update rows for any group directly.
drop policy if exists "Allow insert progress for valid groups" on public.reading_progress;
drop policy if exists "Allow update progress for valid groups" on public.reading_progress;

-- 3. History snapshots hold full member lists. They are read through the
--    server after an edit-token or owner check, never directly.
drop policy if exists "Allow read schedule history for non-expired groups" on public.schedule_history;

-- 4. Member and owner account IDs should not be readable with the public key.
--    The app reads these tables only through the server (service role). The
--    browser needs groups.id and groups.expires_at solely for the realtime
--    progress policy above, so only those columns stay readable.
--    (A column-level revoke alone has no effect while a table-level grant
--    exists, so the table grant is removed first.)
revoke select on public.group_members from anon, authenticated;
revoke select on public.groups from anon, authenticated;
grant select (id, expires_at) on public.groups to anon, authenticated;

-- 5. Faster lookups for recurring cycles.
create index if not exists idx_groups_next_cycle_due on public.groups(next_cycle_due_at)
  where next_cycle_due_at is not null;

-- 6. Reminders honor minutes: run every 15 minutes and let the endpoint send
--    each reminder in the one run whose window contains its time.
do $$
begin
  if exists (select 1 from cron.job where jobname = 'wirddy-notification-reminders') then
    perform cron.alter_job(
      (select jobid from cron.job where jobname = 'wirddy-notification-reminders'),
      schedule := '*/15 * * * *'
    );
  end if;
exception when others then
  null;
end $$;
