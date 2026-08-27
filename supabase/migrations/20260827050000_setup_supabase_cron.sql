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
