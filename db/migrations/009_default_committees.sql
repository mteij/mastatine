-- The two default committees. The placeholder committees seeded in 006 are removed again unless someone already uses them.
INSERT INTO committees (name, description) VALUES
  ('Board', 'The board of S.A. Mastatine'),
  ('MastCie', 'The mast committee')
ON CONFLICT DO NOTHING;

DELETE FROM committees c
WHERE c.name IN ('MastCom', 'The Beacon', 'Guy-Wire', 'Lustrum Committee', 'Foundation')
  AND NOT EXISTS (SELECT 1 FROM committee_members m WHERE m.committee_id = c.id)
  AND NOT EXISTS (SELECT 1 FROM activities a WHERE a.committee_id = c.id)
  AND NOT EXISTS (SELECT 1 FROM meetings m WHERE m.committee_id = c.id)
  AND NOT EXISTS (SELECT 1 FROM action_points p WHERE p.committee_id = c.id);
