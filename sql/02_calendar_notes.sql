-- ============================================================
-- CALENDAR NOTES TABLE
-- Run in: https://supabase.com/dashboard/project/jrvipragbenkvnqihyjt/sql
-- ============================================================

CREATE TABLE IF NOT EXISTS calendar_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_name TEXT NOT NULL,
  date        DATE NOT NULL,
  note        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS calendar_notes_date_idx   ON calendar_notes(date);
CREATE INDEX IF NOT EXISTS calendar_notes_person_idx ON calendar_notes(person_name);

ALTER TABLE calendar_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read calendar_notes"   ON calendar_notes FOR SELECT USING (true);
CREATE POLICY "Public insert calendar_notes" ON calendar_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete calendar_notes" ON calendar_notes FOR DELETE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE calendar_notes;
