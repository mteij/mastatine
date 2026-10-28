-- Who an issue is sent to: the newsletter list, members only, or everyone with an account or a subscription.
ALTER TABLE newsletters ADD COLUMN IF NOT EXISTS audience TEXT NOT NULL DEFAULT 'subscribers' CHECK (audience IN ('subscribers', 'members', 'everyone'));
