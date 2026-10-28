-- The newsletter choice made on the sign-in form, kept until the emailed link is opened and the account is created.
CREATE TABLE IF NOT EXISTS signup_preferences (
  email TEXT NOT NULL,
  newsletter BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS signup_preferences_email_idx ON signup_preferences (lower(email));
