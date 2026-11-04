-- An action point can be given to several people. The single assignee column becomes a join table.
CREATE TABLE IF NOT EXISTS action_point_assignees (
  action_point_id UUID NOT NULL REFERENCES action_points(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  PRIMARY KEY (action_point_id, user_id)
);
CREATE INDEX IF NOT EXISTS action_point_assignees_user_idx ON action_point_assignees (user_id);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'action_points' AND column_name = 'assignee_id') THEN
    INSERT INTO action_point_assignees (action_point_id, user_id)
      SELECT id, assignee_id FROM action_points WHERE assignee_id IS NOT NULL
      ON CONFLICT DO NOTHING;
    ALTER TABLE action_points DROP COLUMN assignee_id;
  END IF;
END $$;
