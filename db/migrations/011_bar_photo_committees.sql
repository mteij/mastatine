-- The bar and photo committees that activities can invite (see the activity form).
INSERT INTO committees (name, description) VALUES
  ('BarCie', 'The bar committee: serves drinks at activities'),
  ('PhotoCie', 'The photo committee: takes pictures at activities')
ON CONFLICT DO NOTHING;
