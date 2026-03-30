-- ============================================================
-- TEST USERS  (run once)
-- Run in: https://supabase.com/dashboard/project/ydmdshlbttpnhsksmtml/sql
-- Creates two member accounts for testing.
-- Passwords: Test1234!
-- ============================================================

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, confirmation_token, recovery_token,
  email_change_token_new, email_change
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(), 'authenticated', 'authenticated',
  'maria@test.com',
  crypt('Test1234!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"display_name":"María González"}',
  false, '', '', '', ''
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'maria@test.com');

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, confirmation_token, recovery_token,
  email_change_token_new, email_change
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(), 'authenticated', 'authenticated',
  'carlos@test.com',
  crypt('Test1234!', gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}',
  '{"display_name":"Carlos Pérez"}',
  false, '', '', '', ''
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'carlos@test.com');

-- Approve both test users (trigger creates them as 'pending', promote to 'member')
UPDATE profiles SET role = 'member'
WHERE email IN ('maria@test.com', 'carlos@test.com');
