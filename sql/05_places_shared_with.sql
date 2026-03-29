-- ============================================================
-- Add shared_with column to places  (safe to re-run)
-- Run in: https://supabase.com/dashboard/project/ydmdshlbttpnhsksmtml/sql
-- ============================================================

ALTER TABLE places ADD COLUMN IF NOT EXISTS shared_with TEXT[] DEFAULT '{}';

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
