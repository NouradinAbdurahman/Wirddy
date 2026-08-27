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
