-- ============================================================
-- TRAVEL LIST — Supabase Seed Script
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/jrvipragbenkvnqihyjt/sql
-- ============================================================

-- 1. LISTS table
CREATE TABLE IF NOT EXISTS lists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ITEMS table
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id TEXT NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'task' CHECK (category IN ('task', 'goal', 'reminder')),
  done BOOLEAN NOT NULL DEFAULT FALSE,
  added_by TEXT NOT NULL DEFAULT 'Anónimo',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS items_list_id_idx ON items(list_id);
CREATE INDEX IF NOT EXISTS items_created_at_idx ON items(created_at DESC);

-- 4. Enable Row Level Security
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies — fully public (no auth required, share by link)
CREATE POLICY "Public read lists" ON lists FOR SELECT USING (true);
CREATE POLICY "Public insert lists" ON lists FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read items" ON items FOR SELECT USING (true);
CREATE POLICY "Public insert items" ON items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update items" ON items FOR UPDATE USING (true);
CREATE POLICY "Public delete items" ON items FOR DELETE USING (true);

-- 6. Enable Realtime on items (for live collaboration)
ALTER PUBLICATION supabase_realtime ADD TABLE items;

-- ============================================================
-- OPTIONAL SEED DATA — remove if you want a clean start
-- ============================================================

INSERT INTO lists (id, name) VALUES
  ('DEMO0001', 'Viaje a Venezuela 🇻🇪')
ON CONFLICT (id) DO NOTHING;

INSERT INTO items (list_id, text, category, done, added_by) VALUES
  ('DEMO0001', 'Reservar vuelos a Caracas', 'task', false, 'Rafa'),
  ('DEMO0001', 'Visitar el Salto Ángel', 'goal', false, 'Rafa'),
  ('DEMO0001', 'Llevar adaptador de corriente', 'reminder', false, 'Rafa'),
  ('DEMO0001', 'Comer un buen pabellón criollo', 'goal', false, 'Rafa'),
  ('DEMO0001', 'Confirmar seguro de viaje', 'task', false, 'Rafa')
ON CONFLICT DO NOTHING;
