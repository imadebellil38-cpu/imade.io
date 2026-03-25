-- Migration: Add avatar_url column to members table
-- Run this in Supabase SQL Editor
ALTER TABLE members ADD COLUMN IF NOT EXISTS avatar_url TEXT;
