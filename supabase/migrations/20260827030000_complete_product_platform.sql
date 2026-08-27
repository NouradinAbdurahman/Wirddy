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
