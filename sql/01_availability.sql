-- ============================================================
-- AVAILABILITY TABLE
-- Run in: https://supabase.com/dashboard/project/jrvipragbenkvnqihyjt/sql
-- ============================================================

CREATE TABLE IF NOT EXISTS availability (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_name TEXT NOT NULL,
  date        DATE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (person_name, date)
);

CREATE INDEX IF NOT EXISTS availability_date_idx   ON availability(date);
CREATE INDEX IF NOT EXISTS availability_person_idx ON availability(person_name);

ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read availability"   ON availability FOR SELECT USING (true);
CREATE POLICY "Public insert availability" ON availability FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete availability" ON availability FOR DELETE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE availability;
