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
