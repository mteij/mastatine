-- Signup options: groups of choices (drinks, meal, ...) a member picks from when subscribing.
-- activities.signup_options: [{ id, label, required, choices: [{ id, label, price_cents }] }], price_cents is added to the base cost.
-- activity_subscriptions.choices: snapshot of what the member picked ([{ group, choice, price_cents }]), so later edits to the
-- options never change what someone signed up for; price_cents is the total they agreed to.
ALTER TABLE activities ADD COLUMN IF NOT EXISTS signup_options JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE activity_subscriptions ADD COLUMN IF NOT EXISTS choices JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE activity_subscriptions ADD COLUMN IF NOT EXISTS price_cents INTEGER;
