-- EmpireTrack Database Schema
-- Execute this in Supabase SQL Editor

-- Members table
CREATE TABLE IF NOT EXISTS members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pseudo TEXT NOT NULL UNIQUE,
  avatar_emoji TEXT DEFAULT '😀',
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habits table
CREATE TABLE IF NOT EXISTS habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '✅',
  color TEXT DEFAULT '#00ff88',
  frequency TEXT DEFAULT 'daily',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Checkins table
CREATE TABLE IF NOT EXISTS checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_habits_member ON habits(member_id);
CREATE INDEX IF NOT EXISTS idx_checkins_member ON checkins(member_id);
CREATE INDEX IF NOT EXISTS idx_checkins_habit ON checkins(habit_id);
CREATE INDEX IF NOT EXISTS idx_checkins_date ON checkins(date);
CREATE INDEX IF NOT EXISTS idx_checkins_member_date ON checkins(member_id, date);

-- Enable Row Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- Public read access (for leaderboard)
CREATE POLICY "Public read members" ON members FOR SELECT USING (true);
CREATE POLICY "Public read habits" ON habits FOR SELECT USING (true);
CREATE POLICY "Public read checkins" ON checkins FOR SELECT USING (true);

-- Public insert/update/delete (anon key - for now without auth)
CREATE POLICY "Public insert members" ON members FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update members" ON members FOR UPDATE USING (true);
CREATE POLICY "Public delete members" ON members FOR DELETE USING (true);

CREATE POLICY "Public insert habits" ON habits FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update habits" ON habits FOR UPDATE USING (true);
CREATE POLICY "Public delete habits" ON habits FOR DELETE USING (true);

CREATE POLICY "Public insert checkins" ON checkins FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update checkins" ON checkins FOR UPDATE USING (true);
CREATE POLICY "Public delete checkins" ON checkins FOR DELETE USING (true);

-- Enable realtime for leaderboard
ALTER PUBLICATION supabase_realtime ADD TABLE checkins;
