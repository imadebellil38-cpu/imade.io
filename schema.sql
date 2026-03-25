-- Empire Habit Tracker - Supabase Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable uuid generation
create extension if not exists "uuid-ossp";

create table members (
  id uuid primary key default uuid_generate_v4(),
  pseudo text unique not null,
  avatar_emoji text not null default '😀',
  bio text,
  created_at timestamptz default now()
);

create table habits (
  id uuid primary key default uuid_generate_v4(),
  member_id uuid references members(id) on delete cascade not null,
  name text not null,
  icon text not null default '✅',
  color text not null default '#00FF88',
  frequency text not null default 'daily',
  custom_days text,  -- comma-separated day numbers: 0=Mon,1=Tue,...,6=Sun e.g. "0,1,3,5"
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table checkins (
  id uuid primary key default uuid_generate_v4(),
  habit_id uuid references habits(id) on delete cascade not null,
  member_id uuid references members(id) on delete cascade not null,
  date date not null default current_date,
  note text,
  created_at timestamptz default now(),
  unique(habit_id, date)
);

create table challenges (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  created_by uuid references members(id) on delete set null,
  start_date date not null,
  end_date date not null,
  habit_name text not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table challenge_participants (
  challenge_id uuid references challenges(id) on delete cascade,
  member_id uuid references members(id) on delete cascade,
  checkin_count int default 0,
  joined_at timestamptz default now(),
  primary key (challenge_id, member_id)
);

create table reactions (
  id uuid primary key default uuid_generate_v4(),
  from_member_id uuid references members(id) on delete cascade not null,
  to_member_id uuid references members(id) on delete cascade not null,
  checkin_id uuid references checkins(id) on delete cascade not null,
  emoji text not null,
  created_at timestamptz default now()
);

-- Indexes
create index idx_checkins_member_date on checkins(member_id, date);
create index idx_checkins_habit_date on checkins(habit_id, date);
create index idx_habits_member on habits(member_id) where is_active = true;
create index idx_reactions_checkin on reactions(checkin_id);
create index idx_challenges_active on challenges(is_active, end_date);

-- Goals (long-term objectives)
create table goals (
  id uuid primary key default uuid_generate_v4(),
  member_id uuid references members(id) on delete cascade not null,
  title text not null,
  icon text not null default '🎯',
  description text,
  target_date date not null,
  milestones jsonb default '[]'::jsonb,
  status text not null default 'active',
  created_at timestamptz default now()
);

create index idx_goals_member on goals(member_id) where status = 'active';

-- Enable Realtime (run in Supabase Dashboard > Database > Replication)
-- Enable realtime for: checkins, reactions, challenge_participants
