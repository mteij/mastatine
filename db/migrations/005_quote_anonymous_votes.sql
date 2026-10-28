-- Anyone can grade a quote: signed-in members are tracked by account, everyone else by a random id kept in a cookie.
ALTER TABLE quote_votes DROP CONSTRAINT quote_votes_pkey;
ALTER TABLE quote_votes ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE quote_votes ADD COLUMN voter_id TEXT;
ALTER TABLE quote_votes ADD CONSTRAINT quote_votes_one_voter CHECK ((user_id IS NULL) <> (voter_id IS NULL));
CREATE UNIQUE INDEX quote_votes_user_idx ON quote_votes (quote_id, user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX quote_votes_voter_idx ON quote_votes (quote_id, voter_id) WHERE voter_id IS NOT NULL;
