-- Membership lifecycle.
--   none     never asked
--   pending  waiting for an admin
--   approved a member (lapses on its own after 5 years without activity, see is_member)
--   declined a request an admin refused
--   revoked  an approved membership an admin ended
-- Admins and committee members always count as members.

-- The old CHECK has a generated name; find it by what it constrains rather than guessing.
DO $$
DECLARE c TEXT;
BEGIN
  FOR c IN SELECT conname FROM pg_constraint WHERE conrelid = '"user"'::regclass AND contype = 'c' AND pg_get_constraintdef(oid) LIKE '%member_status%'
  LOOP
    EXECUTE format('ALTER TABLE "user" DROP CONSTRAINT %I', c);
  END LOOP;
END $$;
ALTER TABLE "user" ADD CONSTRAINT user_member_status_check CHECK (member_status IN ('none', 'pending', 'approved', 'declined', 'revoked'));

-- Who last decided (approved, declined or revoked), when, and for a decline, the reason the person was told.
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS member_decided_at TIMESTAMPTZ;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS member_decided_by TEXT REFERENCES "user"(id) ON DELETE SET NULL;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS member_decision_reason TEXT;

-- Last sign-in. A member who has not signed in for 5 years stops being a member.
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
UPDATE "user" u SET last_active_at = COALESCE((SELECT MAX(s."createdAt") FROM session s WHERE s."userId" = u.id), u."updatedAt", u."createdAt");

CREATE OR REPLACE FUNCTION is_member(uid TEXT) RETURNS BOOLEAN
LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM "user" u
    WHERE u.id = uid AND NOT u.banned
      AND (
        u.role = 'admin'
        OR EXISTS (SELECT 1 FROM committee_members m WHERE m.user_id = u.id)
        OR (u.member_status = 'approved' AND u.last_active_at > NOW() - INTERVAL '5 years')
      )
  )
$$;
