-- ============================================================
-- PLACES TABLE
-- Run in: https://supabase.com/dashboard/project/jrvipragbenkvnqihyjt/sql
-- ============================================================

CREATE TABLE IF NOT EXISTS places (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  category    TEXT NOT NULL DEFAULT 'attraction'
                CHECK (category IN ('attraction','restaurant','beach','activity','shopping','other')),
  added_by    TEXT NOT NULL DEFAULT 'Anónimo',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS places_category_idx    ON places(category);
CREATE INDEX IF NOT EXISTS places_created_at_idx  ON places(created_at DESC);

ALTER TABLE places ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read places"   ON places FOR SELECT USING (true);
CREATE POLICY "Public insert places" ON places FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete places" ON places FOR DELETE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE places;
