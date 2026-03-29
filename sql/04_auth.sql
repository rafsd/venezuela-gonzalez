-- ============================================================
-- AUTH / PROFILES TABLE  (safe to re-run)
-- Run in: https://supabase.com/dashboard/project/jrvipragbenkvnqihyjt/sql
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  display_name  TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (role IN ('admin', 'member', 'pending', 'rejected')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read profiles" ON profiles;
DROP POLICY IF EXISTS "Service can insert profiles"     ON profiles;
DROP POLICY IF EXISTS "Admin can update profiles"       ON profiles;

-- Any logged-in user can read all profiles
CREATE POLICY "Authenticated can read profiles" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Trigger inserts via SECURITY DEFINER, but allow direct insert too
CREATE POLICY "Service can insert profiles" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Only rafsd@hotmail.com can approve / reject
CREATE POLICY "Admin can update profiles" ON profiles
  FOR UPDATE USING (
    (SELECT email FROM auth.users WHERE id = auth.uid()) = 'rafsd@hotmail.com'
  );

-- ── Trigger: auto-create profile row when a user signs up ────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    CASE WHEN NEW.email = 'rafsd@hotmail.com' THEN 'admin' ELSE 'pending' END
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
