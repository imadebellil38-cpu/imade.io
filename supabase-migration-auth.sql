-- ===== AUTH MIGRATION =====
-- Run this in Supabase SQL Editor

-- 1. Add auth_id column to members
ALTER TABLE members ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS idx_members_auth_id ON members(auth_id);

-- 2. Delete all existing data (fresh start with auth)
DELETE FROM checkins;
DELETE FROM habits;
DELETE FROM members;

-- 3. Keep read policies public, restrict writes to authenticated users

-- Drop old wide-open write policies (ignore errors if they don't exist)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public insert members" ON members;
  DROP POLICY IF EXISTS "Public update members" ON members;
  DROP POLICY IF EXISTS "Public delete members" ON members;
  DROP POLICY IF EXISTS "Public insert habits" ON habits;
  DROP POLICY IF EXISTS "Public update habits" ON habits;
  DROP POLICY IF EXISTS "Public delete habits" ON habits;
  DROP POLICY IF EXISTS "Public insert checkins" ON checkins;
  DROP POLICY IF EXISTS "Public update checkins" ON checkins;
  DROP POLICY IF EXISTS "Public delete checkins" ON checkins;
END $$;

-- Members: auth-based write
CREATE POLICY "Auth insert members" ON members FOR INSERT
  WITH CHECK (auth.uid() = auth_id);
CREATE POLICY "Auth update members" ON members FOR UPDATE
  USING (auth.uid() = auth_id);
CREATE POLICY "Auth delete members" ON members FOR DELETE
  USING (auth.uid() = auth_id);

-- Habits: owner-based write
CREATE POLICY "Auth insert habits" ON habits FOR INSERT
  WITH CHECK (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));
CREATE POLICY "Auth update habits" ON habits FOR UPDATE
  USING (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));
CREATE POLICY "Auth delete habits" ON habits FOR DELETE
  USING (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));

-- Checkins: owner-based write
CREATE POLICY "Auth insert checkins" ON checkins FOR INSERT
  WITH CHECK (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));
CREATE POLICY "Auth update checkins" ON checkins FOR UPDATE
  USING (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));
CREATE POLICY "Auth delete checkins" ON checkins FOR DELETE
  USING (member_id IN (SELECT id FROM members WHERE auth_id = auth.uid()));
