-- =============================================================================
-- Migration: give every group member a public ID
--
-- Members saved before public IDs existed have none, so their personal links
-- fall back to the row ID. This assigns each one a random ID in the same
-- format the app uses ("m_" + 12 hex characters). Existing IDs are untouched.
-- =============================================================================

update public.group_members
set public_id = 'm_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)
where public_id is null;
