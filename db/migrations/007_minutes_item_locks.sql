-- Live minuting: whoever is typing in an agenda item holds a short lock that they keep renewing while they stay in the field.
ALTER TABLE meeting_items ADD COLUMN IF NOT EXISTS locked_by TEXT REFERENCES "user"(id) ON DELETE SET NULL;
ALTER TABLE meeting_items ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ;
