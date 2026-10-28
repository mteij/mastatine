-- When the "tomorrow" reminder was sent for a subscription (NULL: not yet), so it is sent at most once.
ALTER TABLE activity_subscriptions ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;
