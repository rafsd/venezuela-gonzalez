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

-- 2. CALENDAR NOTES table
CREATE TABLE IF NOT EXISTS calendar_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_name TEXT NOT NULL,
  date        DATE NOT NULL,
  note        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PLACES table
CREATE TABLE IF NOT EXISTS places (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  category    TEXT NOT NULL DEFAULT 'attraction'
                CHECK (category IN ('attraction','restaurant','beach','activity','shopping','other')),
  added_by    TEXT NOT NULL DEFAULT 'Anónimo',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS availability_date_idx       ON availability(date);
CREATE INDEX IF NOT EXISTS availability_person_idx     ON availability(person_name);
CREATE INDEX IF NOT EXISTS calendar_notes_date_idx     ON calendar_notes(date);
CREATE INDEX IF NOT EXISTS calendar_notes_person_idx   ON calendar_notes(person_name);
CREATE INDEX IF NOT EXISTS places_category_idx         ON places(category);
CREATE INDEX IF NOT EXISTS places_created_at_idx       ON places(created_at DESC);

-- 5. Row Level Security
ALTER TABLE availability    ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_notes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE places           ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies — fully public (no auth required)
CREATE POLICY "Public read availability"   ON availability FOR SELECT USING (true);
CREATE POLICY "Public insert availability" ON availability FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete availability" ON availability FOR DELETE USING (true);

CREATE POLICY "Public read calendar_notes"   ON calendar_notes FOR SELECT USING (true);
CREATE POLICY "Public insert calendar_notes" ON calendar_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete calendar_notes" ON calendar_notes FOR DELETE USING (true);

CREATE POLICY "Public read places"   ON places FOR SELECT USING (true);
CREATE POLICY "Public insert places" ON places FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete places" ON places FOR DELETE USING (true);

-- 7. Enable Realtime on all tables
ALTER PUBLICATION supabase_realtime ADD TABLE availability;
ALTER PUBLICATION supabase_realtime ADD TABLE calendar_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE places;
