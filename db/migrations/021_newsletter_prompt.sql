-- The newsletter question is asked once, on the first sign-in after an account exists (and its answer, or "later", ends the prompt).
-- Anyone who already has a subscription record has answered before and is not asked again.
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS newsletter_prompted_at TIMESTAMPTZ;
UPDATE "user" u SET newsletter_prompted_at = NOW()
WHERE newsletter_prompted_at IS NULL
  AND EXISTS (SELECT 1 FROM newsletter_subscribers s WHERE lower(s.email) = lower(u.email));

-- The sign-in form no longer carries a newsletter box, so the staging table for its choice is gone.
DROP TABLE IF EXISTS signup_preferences;
