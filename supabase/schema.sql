-- =============================================================================
-- Wirddy database schema (combined)
--
-- Built from supabase/migrations/*.sql in order. The migrations are the source
-- of truth; regenerate this file after adding one:
--
--   for f in supabase/migrations/*.sql; do echo "-- >>> $f"; cat "$f"; echo; done
-- =============================================================================

-- >>> supabase/migrations/20260827000000_create_wirddy_schema.sql
-- =============================================================================
-- Wirddy Production Database Schema & Migration (No-Login Saved Groups)
-- Version: 1.0.0
-- =============================================================================

-- Enable pgcrypto / uuid extensions
create extension if not exists "pgcrypto";

-- 1. GROUPS TABLE
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  public_id text unique not null check (char_length(public_id) between 8 and 64),
  edit_token_hash text not null,
  name text not null check (char_length(name) between 1 and 100),
  language text not null default 'ar' check (language in ('ar', 'en')),
  direction text not null default 'rtl' check (direction in ('rtl', 'ltr')),
  scheduler_version text not null default '1.0',
  expires_at timestamp with time zone not null default (timezone('utc'::text, now()) + interval '365 days'),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  owner_user_id uuid default null -- Optional link to auth.users for future authenticated accounts
);

-- 2. GROUP MEMBERS TABLE
create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  knowledge_type text not null default 'entire' check (knowledge_type in ('entire', 'juz_range', 'surah_range')),
  start_juz integer not null default 1 check (start_juz between 1 and 30),
  end_juz integer not null default 30 check (end_juz between 1 and 30),
  start_surah integer check (start_surah between 1 and 114),
  end_surah integer check (end_surah between 1 and 114),
  weekly_amount integer not null check (weekly_amount between 1 and 30),
  sort_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  check (start_juz <= end_juz)
);

-- 3. SCHEDULE PLANS TABLE
create table if not exists public.schedule_plans (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  version_number integer not null default 1 check (version_number >= 1),
  weeks_count integer not null check (weeks_count between 1 and 52),
  total_juz_per_week integer not null default 30 check (total_juz_per_week = 30),
  scheduler_version text not null default '1.0',
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. SCHEDULE WEEKS TABLE
create table if not exists public.schedule_weeks (
  id uuid primary key default gen_random_uuid(),
  schedule_plan_id uuid not null references public.schedule_plans(id) on delete cascade,
  week_number integer not null check (week_number >= 1),
  total_juz integer not null default 30 check (total_juz = 30),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (schedule_plan_id, week_number)
);

-- 5. SCHEDULE ASSIGNMENTS TABLE
create table if not exists public.schedule_assignments (
  id uuid primary key default gen_random_uuid(),
  schedule_week_id uuid not null references public.schedule_weeks(id) on delete cascade,
  member_id uuid not null references public.group_members(id) on delete cascade,
  member_name text not null check (char_length(member_name) between 1 and 100),
  weekly_amount integer not null check (weekly_amount between 1 and 30),
  start_juz integer not null check (start_juz between 1 and 30),
  end_juz integer not null check (end_juz between 1 and 30),
  start_surah integer not null check (start_surah between 1 and 114),
  start_surah_name_ar text not null,
  start_surah_name_en text not null,
  start_ayah integer not null check (start_ayah >= 1),
  end_surah integer not null check (end_surah between 1 and 114),
  end_surah_name_ar text not null,
  end_surah_name_en text not null,
  end_ayah integer not null check (end_ayah >= 1),
  start_global_ayah integer default null,
  end_global_ayah integer default null,
  sort_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =============================================================================
-- PERFORMANCE INDEXES
-- =============================================================================
create index if not exists idx_groups_expires_at on public.groups(expires_at);
create index if not exists idx_group_members_group_id on public.group_members(group_id, sort_order);
create index if not exists idx_schedule_plans_group_id on public.schedule_plans(group_id, is_active);
create index if not exists idx_schedule_weeks_plan_id on public.schedule_weeks(schedule_plan_id, week_number);
create index if not exists idx_schedule_assignments_week_id on public.schedule_assignments(schedule_week_id, sort_order);
create index if not exists idx_schedule_assignments_member_id on public.schedule_assignments(member_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.schedule_plans enable row level security;
alter table public.schedule_weeks enable row level security;
alter table public.schedule_assignments enable row level security;

-- Groups: Public can SELECT non-expired groups
create policy "Allow public read access to non-expired groups"
  on public.groups for select
  using (expires_at > timezone('utc'::text, now()));

-- Group Members: Public can SELECT members belonging to non-expired groups
create policy "Allow public read access to members of non-expired groups"
  on public.group_members for select
  using (
    exists (
      select 1 from public.groups g
      where g.id = group_members.group_id
        and g.expires_at > timezone('utc'::text, now())
    )
  );

-- Schedule Plans: Public can SELECT active plans of non-expired groups
create policy "Allow public read access to plans of non-expired groups"
  on public.schedule_plans for select
  using (
    exists (
      select 1 from public.groups g
      where g.id = schedule_plans.group_id
        and g.expires_at > timezone('utc'::text, now())
    )
  );

-- Schedule Weeks: Public can SELECT weeks of non-expired groups
create policy "Allow public read access to weeks of non-expired groups"
  on public.schedule_weeks for select
  using (
    exists (
      select 1 from public.schedule_plans p
      join public.groups g on g.id = p.group_id
      where p.id = schedule_weeks.schedule_plan_id
        and g.expires_at > timezone('utc'::text, now())
    )
  );

-- Schedule Assignments: Public can SELECT assignments of non-expired groups
create policy "Allow public read access to assignments of non-expired groups"
  on public.schedule_assignments for select
  using (
    exists (
      select 1 from public.schedule_weeks w
      join public.schedule_plans p on p.id = w.schedule_plan_id
      join public.groups g on g.id = p.group_id
      where w.id = schedule_assignments.schedule_week_id
        and g.expires_at > timezone('utc'::text, now())
    )
  );

-- =============================================================================
-- SECURITY ADVISOR REMEDIATION
-- =============================================================================
-- Revoke execution of internal trigger functions from anon and authenticated roles
do $$
begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on p.pronamespace = n.oid
    where n.nspname = 'public' and p.proname = 'rls_auto_enable'
  ) then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated;';
  end if;
end
$$;

-- >>> supabase/migrations/20260827010000_add_advanced_scheduler_settings.sql
-- =============================================================================
-- Migration: Add Advanced Scheduler Settings (Rotation, Custom Range, Start Point)
-- Version: 1.1.0
-- =============================================================================

alter table public.groups
  add column if not exists rotation_style text not null default 'medium' check (rotation_style in ('large', 'medium', 'small', 'random')),
  add column if not exists range_type text not null default 'full' check (range_type in ('full', 'custom')),
  add column if not exists start_juz integer not null default 1 check (start_juz between 1 and 30),
  add column if not exists range_start_surah integer default null check (range_start_surah between 1 and 114),
  add column if not exists range_start_ayah integer default null check (range_start_ayah >= 1),
  add column if not exists range_end_surah integer default null check (range_end_surah between 1 and 114),
  add column if not exists range_end_ayah integer default null check (range_end_ayah >= 1);

alter table public.schedule_plans
  add column if not exists rotation_style text not null default 'medium' check (rotation_style in ('large', 'medium', 'small', 'random')),
  add column if not exists range_type text not null default 'full' check (range_type in ('full', 'custom')),
  add column if not exists start_juz integer not null default 1 check (start_juz between 1 and 30),
  add column if not exists range_start_surah integer default null,
  add column if not exists range_start_ayah integer default null,
  add column if not exists range_end_surah integer default null,
  add column if not exists range_end_ayah integer default null;

-- >>> supabase/migrations/20260827020000_add_advanced_features.sql
-- =============================================================================
-- Migration: Add Advanced Features (Dates, Ramadan Mode, Daily Division, Titles, Member Public IDs)
-- Version: 1.2.0
-- =============================================================================

-- 1. Alter groups table
alter table public.groups
  add column if not exists start_date date default null,
  add column if not exists uses_dates boolean not null default false,
  add column if not exists occasion_type text not null default 'normal' check (occasion_type in ('normal', 'ramadan')),
  add column if not exists islamic_year integer default null check (islamic_year is null or (islamic_year between 1400 and 1600)),
  add column if not exists daily_division_enabled boolean not null default false,
  add column if not exists title text default null check (title is null or char_length(title) <= 200),
  add column if not exists description text default null check (description is null or char_length(description) <= 500);

-- 2. Alter group_members table for unguessable member public IDs
alter table public.group_members
  add column if not exists public_id text default null;

create index if not exists idx_group_members_public_id on public.group_members(group_id, public_id);

-- 3. Alter schedule_plans table
alter table public.schedule_plans
  add column if not exists start_date date default null,
  add column if not exists uses_dates boolean not null default false,
  add column if not exists occasion_type text not null default 'normal' check (occasion_type in ('normal', 'ramadan')),
  add column if not exists islamic_year integer default null,
  add column if not exists daily_division_enabled boolean not null default false,
  add column if not exists title text default null,
  add column if not exists description text default null;

-- 4. Alter schedule_assignments table for storing precomputed daily partitions
alter table public.schedule_assignments
  add column if not exists daily_breakdown jsonb default null;

-- >>> supabase/migrations/20260827030000_complete_product_platform.sql
-- =============================================================================
-- Migration: Complete Product Platform (Ownership, Progress, Bookmarks, Announcements, History, Notifications)
-- Version: 1.3.0
-- =============================================================================

-- 1. Alter groups table for status, archive, and recurrence
alter table public.groups
  add column if not exists status text not null default 'active' check (status in ('draft', 'active', 'completed', 'archived')),
  add column if not exists is_archived boolean not null default false,
  add column if not exists recurrence jsonb default null;

create index if not exists idx_groups_owner on public.groups(owner_user_id, is_archived, status);

-- 2. Alter group_members table for optional member account linking
alter table public.group_members
  add column if not exists linked_user_id uuid default null;

create index if not exists idx_group_members_linked_user on public.group_members(linked_user_id);

-- 3. Create reading_progress table
create table if not exists public.reading_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default null,
  group_id uuid not null references public.groups(id) on delete cascade,
  member_id uuid not null references public.group_members(id) on delete cascade,
  week_number integer not null check (week_number >= 1),
  day_number integer not null check (day_number between 1 and 7),
  is_completed boolean not null default false,
  completed_at timestamp with time zone default null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (group_id, member_id, week_number, day_number)
);

create index if not exists idx_reading_progress_group_member on public.reading_progress(group_id, member_id, week_number);
create index if not exists idx_reading_progress_user on public.reading_progress(user_id);

-- 4. Create bookmarks table
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  surah_number integer not null check (surah_number between 1 and 114),
  ayah_number integer not null check (ayah_number >= 1),
  juz_number integer not null check (juz_number between 1 and 30),
  note text default null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_bookmarks_user on public.bookmarks(user_id, updated_at desc);

-- 5. Create announcements table
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  content text not null check (char_length(content) between 1 and 2000),
  created_by uuid default null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_announcements_group on public.announcements(group_id, created_at desc);

-- 6. Create schedule_history table
create table if not exists public.schedule_history (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  action_type text not null,
  description text not null,
  created_by uuid default null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_schedule_history_group on public.schedule_history(group_id, created_at desc);

-- 7. Create notification_preferences table
create table if not exists public.notification_preferences (
  user_id uuid primary key,
  daily_reminder_enabled boolean not null default true,
  reminder_time text not null default '20:00',
  incomplete_reminder_enabled boolean not null default true,
  weekly_summary_enabled boolean not null default false,
  group_announcements_enabled boolean not null default true,
  timezone text not null default 'UTC',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Create push_subscriptions table
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_push_subscriptions_user on public.push_subscriptions(user_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) FOR NEW TABLES
-- =============================================================================
alter table public.reading_progress enable row level security;
alter table public.bookmarks enable row level security;
alter table public.announcements enable row level security;
alter table public.schedule_history enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.push_subscriptions enable row level security;

-- Reading progress: Public can SELECT progress for valid groups
create policy "Allow public read progress for non-expired groups"
  on public.reading_progress for select
  using (
    exists (
      select 1 from public.groups g
      where g.id = reading_progress.group_id
        and g.expires_at > timezone('utc'::text, now())
    )
  );

-- Reading progress: Insert and update allowed
create policy "Allow insert progress for valid groups"
  on public.reading_progress for insert
  with check (
    exists (
      select 1 from public.groups g
      where g.id = reading_progress.group_id
        and g.expires_at > timezone('utc'::text, now())
    )
  );

create policy "Allow update progress for valid groups"
  on public.reading_progress for update
  using (
    exists (
      select 1 from public.groups g
      where g.id = reading_progress.group_id
        and g.expires_at > timezone('utc'::text, now())
    )
  );

-- Bookmarks: Authenticated users manage their own bookmarks
create policy "Allow users to manage their own bookmarks"
  on public.bookmarks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Announcements: Public read for group members / viewers
create policy "Allow read announcements for non-expired groups"
  on public.announcements for select
  using (
    exists (
      select 1 from public.groups g
      where g.id = announcements.group_id
        and g.expires_at > timezone('utc'::text, now())
    )
  );

-- Schedule history: Public read for non-expired groups
create policy "Allow read schedule history for non-expired groups"
  on public.schedule_history for select
  using (
    exists (
      select 1 from public.groups g
      where g.id = schedule_history.group_id
        and g.expires_at > timezone('utc'::text, now())
    )
  );

-- Notification preferences: User manages their own preferences
create policy "Allow users to manage their notification preferences"
  on public.notification_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Push subscriptions: User manages their push subscriptions
create policy "Allow users to manage their push subscriptions"
  on public.push_subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- >>> supabase/migrations/20260827040000_final_completion_phase.sql
-- =============================================================================
-- Migration: Final Completion Phase (History Snapshots, Recurrence Metadata, RLS Hardening)
-- Version: 1.4.0
-- =============================================================================

-- 1. Alter schedule_history table to store full JSON snapshots of schedules
alter table public.schedule_history
  add column if not exists snapshot jsonb default null;

-- 2. Alter groups table for recurring cycle execution tracking and idempotency
alter table public.groups
  add column if not exists recurring_source_group_id uuid references public.groups(id) on delete set null,
  add column if not exists cycle_index integer not null default 1,
  add column if not exists last_cycle_generated_at timestamp with time zone default null,
  add column if not exists next_cycle_due_at timestamp with time zone default null;

create index if not exists idx_groups_recurring_source on public.groups(recurring_source_group_id, cycle_index);

-- 3. RLS Security Hardening for reading_progress
drop policy if exists "Allow update progress for valid groups" on public.reading_progress;
drop policy if exists "Allow insert progress for valid groups" on public.reading_progress;

create policy "Allow insert progress for valid groups"
  on public.reading_progress for insert
  with check (
    exists (
      select 1 from public.groups g
      where g.id = reading_progress.group_id
        and g.expires_at > timezone('utc'::text, now())
    )
    and (
      -- If user is authenticated, user_id must match auth.uid() or be null
      auth.uid() is null or user_id is null or user_id = auth.uid()
    )
  );

create policy "Allow update progress for valid groups"
  on public.reading_progress for update
  using (
    exists (
      select 1 from public.groups g
      where g.id = reading_progress.group_id
        and g.expires_at > timezone('utc'::text, now())
    )
  )
  with check (
    -- Prevent unauthorized reassignment of user_id
    auth.uid() is null or user_id is null or user_id = auth.uid()
  );

-- >>> supabase/migrations/20260827050000_setup_supabase_cron.sql
-- ==============================================================================
-- Wirddy Migration: Setup Supabase Cron + pg_net + Vault Scheduling
-- Architecture: Supabase pg_cron -> pg_net HTTP POST -> Vercel API Endpoints
-- Secrets: Retrieved dynamically from Supabase Vault (zero secrets in code)
-- ==============================================================================

-- 1. Ensure required extensions are active
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- 2. Unschedule any prior jobs with the same names to prevent duplicates
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'wirddy-notification-reminders') THEN
    PERFORM cron.unschedule('wirddy-notification-reminders');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'wirddy-recurring-schedules') THEN
    PERFORM cron.unschedule('wirddy-recurring-schedules');
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Gracefully ignore if cron schema is being initialized
  NULL;
END $$;

-- 3. Create Hourly Notification Reminders Job (0 * * * *)
SELECT cron.schedule(
  'wirddy-notification-reminders',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://wirddy.vercel.app/api/cron/notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE((SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_secret' LIMIT 1), '')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- 4. Create Daily Recurring Schedules Job (0 0 * * *)
SELECT cron.schedule(
  'wirddy-recurring-schedules',
  '0 0 * * *',
  $$
  SELECT net.http_post(
    url := 'https://wirddy.vercel.app/api/cron/recurring',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || COALESCE((SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'cron_secret' LIMIT 1), '')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- >>> supabase/migrations/20261011000000_fix_audit_hardening.sql
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

