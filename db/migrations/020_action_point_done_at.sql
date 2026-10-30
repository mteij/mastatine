-- When a point was ticked off. A done point stays on the lists, crossed out, until the committee's next meeting has passed.
ALTER TABLE action_points ADD COLUMN IF NOT EXISTS done_at TIMESTAMPTZ;
-- Points done before this existed have no real date; created_at keeps them from lingering.
UPDATE action_points SET done_at = created_at WHERE is_done AND done_at IS NULL;
