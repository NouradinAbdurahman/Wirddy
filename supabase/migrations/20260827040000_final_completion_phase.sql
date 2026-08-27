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
