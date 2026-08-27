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
