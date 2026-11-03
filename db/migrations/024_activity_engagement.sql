-- Waitlist for full activities. A row is removed when the person subscribes or leaves.
-- notified_at: when they were told a spot opened. They keep that spot in mind for 24 hours, then drop off the list.
CREATE TABLE IF NOT EXISTS activity_waitlist (
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notified_at TIMESTAMPTZ,
  PRIMARY KEY (activity_id, user_id)
);
CREATE INDEX IF NOT EXISTS activity_waitlist_user_idx ON activity_waitlist (user_id);

-- Anonymous counters for the activity statistics (no person is recorded): subscribed, unsubscribed, waitlisted.
CREATE TABLE IF NOT EXISTS activity_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('subscribed', 'unsubscribed', 'waitlisted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS activity_events_activity_idx ON activity_events (activity_id, created_at);

-- What committees sent to their participants: edits ("update"), cancellations and free-form messages ("message").
-- Kept to rate-limit messages and to show in the statistics. The text itself is not stored.
CREATE TABLE IF NOT EXISTS activity_messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  sent_by TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  kind TEXT NOT NULL CHECK (kind IN ('update', 'message')),
  recipients INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS activity_messages_activity_idx ON activity_messages (activity_id, created_at);
