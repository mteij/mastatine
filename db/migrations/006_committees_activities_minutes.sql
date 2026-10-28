-- Committees, the Activities MastApp (Allison-style) and the Minutes MastApp (Minnie-style).
CREATE TABLE IF NOT EXISTS committees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS committees_name_idx ON committees (lower(name));

CREATE TABLE IF NOT EXISTS committee_members (
  committee_id UUID NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  is_chair BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (committee_id, user_id)
);
CREATE INDEX IF NOT EXISTS committee_members_user_idx ON committee_members (user_id);

INSERT INTO committees (name, description) VALUES
  ('MastCom', 'Events'),
  ('The Beacon', 'Communications'),
  ('Guy-Wire', 'Sponsorship and partners'),
  ('Lustrum Committee', 'Celebrations'),
  ('Foundation', 'Finance audit')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_id UUID NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  description TEXT NOT NULL DEFAULT '' CHECK (char_length(description) <= 5000),
  location TEXT NOT NULL DEFAULT '' CHECK (char_length(location) <= 200),
  cost_cents INTEGER CHECK (cost_cents IS NULL OR cost_cents >= 0),
  subscription_limit INTEGER CHECK (subscription_limit IS NULL OR subscription_limit > 0),
  estimated_attendees INTEGER CHECK (estimated_attendees IS NULL OR estimated_attendees >= 0),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  subscription_opens_at TIMESTAMPTZ,
  subscription_closes_at TIMESTAMPTZ,
  allow_unsubscribe BOOLEAN NOT NULL DEFAULT TRUE,
  needs_ero BOOLEAN NOT NULL DEFAULT FALSE,
  uses_budget BOOLEAN NOT NULL DEFAULT FALSE,
  invite_boss BOOLEAN NOT NULL DEFAULT FALSE,
  boss_note TEXT NOT NULL DEFAULT '' CHECK (char_length(boss_note) <= 2000),
  invite_flitcie BOOLEAN NOT NULL DEFAULT FALSE,
  flitcie_note TEXT NOT NULL DEFAULT '' CHECK (char_length(flitcie_note) <= 2000),
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  poster_url TEXT,
  created_by TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS activities_starts_idx ON activities (starts_at);
CREATE INDEX IF NOT EXISTS activities_committee_idx ON activities (committee_id);

CREATE TABLE IF NOT EXISTS activity_subscriptions (
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (activity_id, user_id)
);
CREATE INDEX IF NOT EXISTS activity_subscriptions_user_idx ON activity_subscriptions (user_id);

-- Minutes: a meeting has agenda items (position, level 0 = "1.", level 1 = "a.") that carry the minutes, plus action points.
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_id UUID NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  starts_at TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL DEFAULT '' CHECK (char_length(location) <= 200),
  minutes_status TEXT NOT NULL DEFAULT 'todo' CHECK (minutes_status IN ('todo', 'draft', 'done')),
  created_by TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS meetings_starts_idx ON meetings (starts_at DESC);
CREATE INDEX IF NOT EXISTS meetings_committee_idx ON meetings (committee_id);

CREATE TABLE IF NOT EXISTS meeting_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  level SMALLINT NOT NULL DEFAULT 0 CHECK (level IN (0, 1)),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  notes TEXT NOT NULL DEFAULT '' CHECK (char_length(notes) <= 10000)
);
CREATE INDEX IF NOT EXISTS meeting_items_meeting_idx ON meeting_items (meeting_id, position);

CREATE TABLE IF NOT EXISTS action_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  committee_id UUID NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
  assignee_id TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 500),
  deadline DATE,
  is_done BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS action_points_assignee_idx ON action_points (assignee_id) WHERE NOT is_done;
CREATE INDEX IF NOT EXISTS action_points_meeting_idx ON action_points (meeting_id);
