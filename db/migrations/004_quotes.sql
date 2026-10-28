-- Quotes MastApp: members submit things people said and grade each other's quotes from 1 to 10.
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 3 AND 1000),
  author TEXT NOT NULL CHECK (char_length(author) BETWEEN 1 AND 80),
  said_on DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS quotes_said_on_idx ON quotes (said_on DESC, created_at DESC);

-- One grade per member per quote; deleting an account removes its grades.
CREATE TABLE IF NOT EXISTS quote_votes (
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  score SMALLINT NOT NULL CHECK (score BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (quote_id, user_id)
);
