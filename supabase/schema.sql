-- Mastatine database schema
-- Run this in the Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Towers table
CREATE TABLE IF NOT EXISTS towers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  submitter_name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  vote_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Votes table (one vote per tower per browser fingerprint)
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tower_id UUID NOT NULL REFERENCES towers(id) ON DELETE CASCADE,
  voter_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tower_id, voter_id)
);

-- Index for fast leaderboard queries
CREATE INDEX IF NOT EXISTS towers_vote_count_idx ON towers(vote_count DESC);
CREATE INDEX IF NOT EXISTS votes_tower_id_idx ON votes(tower_id);

-- Row Level Security
ALTER TABLE towers ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read towers
CREATE POLICY "towers_select" ON towers FOR SELECT USING (true);

-- Allow anyone to insert towers (anon key)
CREATE POLICY "towers_insert" ON towers FOR INSERT WITH CHECK (true);

-- Allow server (service role) to update vote_count
CREATE POLICY "towers_update_votes" ON towers FOR UPDATE USING (true) WITH CHECK (true);

-- Allow anyone to read votes
CREATE POLICY "votes_select" ON votes FOR SELECT USING (true);

-- Allow anyone to insert a vote
CREATE POLICY "votes_insert" ON votes FOR INSERT WITH CHECK (true);

-- Function to atomically increment vote_count
CREATE OR REPLACE FUNCTION increment_vote_count(tower_id UUID)
RETURNS void AS $$
  UPDATE towers SET vote_count = vote_count + 1 WHERE id = tower_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Storage bucket for tower images (run in Supabase dashboard → Storage)
-- 1. Create a bucket named "towers" with public access
-- 2. Set max file size to 5MB
-- 3. Allow image/* mime types
