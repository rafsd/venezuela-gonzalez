-- ============================================================
-- VENEZUELA GONZÁLEZ — Supabase Seed Script
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/jrvipragbenkvnqihyjt/sql
-- ============================================================

-- 1. AVAILABILITY table
--    One row per (person, date) — unique constraint prevents duplicates.
CREATE TABLE IF NOT EXISTS availability (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_name TEXT NOT NULL,
  date        DATE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (person_name, date)
);

-- 2. PLACES table
CREATE TABLE IF NOT EXISTS places (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  category    TEXT NOT NULL DEFAULT 'attraction'
                CHECK (category IN ('attraction','restaurant','beach','activity','shopping','other')),
  added_by    TEXT NOT NULL DEFAULT 'Anónimo',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS availability_date_idx     ON availability(date);
CREATE INDEX IF NOT EXISTS availability_person_idx   ON availability(person_name);
CREATE INDEX IF NOT EXISTS places_category_idx       ON places(category);
CREATE INDEX IF NOT EXISTS places_created_at_idx     ON places(created_at DESC);

-- 4. Row Level Security
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE places       ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies — fully public (no auth required)
CREATE POLICY "Public read availability"   ON availability FOR SELECT USING (true);
CREATE POLICY "Public insert availability" ON availability FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete availability" ON availability FOR DELETE USING (true);

CREATE POLICY "Public read places"   ON places FOR SELECT USING (true);
CREATE POLICY "Public insert places" ON places FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete places" ON places FOR DELETE USING (true);

-- 6. Enable Realtime on both tables
ALTER PUBLICATION supabase_realtime ADD TABLE availability;
ALTER PUBLICATION supabase_realtime ADD TABLE places;
