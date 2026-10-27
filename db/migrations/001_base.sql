-- Base schema: towers (masts) and anonymous votes.

CREATE TABLE IF NOT EXISTS towers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  submitter_name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  height DOUBLE PRECISION,
  vote_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tower_id UUID NOT NULL REFERENCES towers(id) ON DELETE CASCADE,
  voter_id TEXT NOT NULL,
  direction TEXT NOT NULL DEFAULT 'up' CHECK (direction IN ('up', 'down')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tower_id, voter_id)
);

CREATE INDEX IF NOT EXISTS towers_vote_count_idx ON towers(vote_count DESC);
CREATE INDEX IF NOT EXISTS votes_tower_id_idx ON votes(tower_id);
CREATE INDEX IF NOT EXISTS votes_voter_id_idx ON votes(voter_id);
CREATE INDEX IF NOT EXISTS votes_created_at_idx ON votes(created_at);
