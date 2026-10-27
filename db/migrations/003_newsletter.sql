-- Quarterly newsletter: double opt-in subscribers, admin-authored issues, and a per-recipient send log
-- that makes sending resumable and prevents duplicate sends.
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'unsubscribed')),
  confirm_token_hash TEXT,
  confirm_expires_at TIMESTAMPTZ,
  confirmation_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_email_idx ON newsletter_subscribers (lower(email));
CREATE INDEX IF NOT EXISTS newsletter_subscribers_status_idx ON newsletter_subscribers (status);

CREATE TABLE IF NOT EXISTS newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'sent')),
  created_by TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS newsletter_sends (
  newsletter_id UUID NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
  subscriber_id UUID NOT NULL REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error TEXT,
  sent_at TIMESTAMPTZ,
  PRIMARY KEY (newsletter_id, subscriber_id)
);
