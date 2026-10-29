-- An action point remembers the agenda item it was raised under, so the minutes can show it right there.
-- Removing the item from the agenda leaves the point in the meeting's list, just without a place in the minutes.
ALTER TABLE action_points ADD COLUMN IF NOT EXISTS item_id UUID REFERENCES meeting_items(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS action_points_item_idx ON action_points (item_id) WHERE item_id IS NOT NULL;
