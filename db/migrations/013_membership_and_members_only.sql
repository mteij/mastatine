-- Membership is requested by the person and approved by an admin.
-- none: never asked, pending: waiting for an admin, approved: a member.
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS member_status TEXT NOT NULL DEFAULT 'none' CHECK (member_status IN ('none', 'pending', 'approved'));
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS member_requested_at TIMESTAMPTZ;
UPDATE "user" SET member_status = 'approved' WHERE role = 'admin';

-- Activities can be restricted to members (hidden from everyone else).
ALTER TABLE activities ADD COLUMN IF NOT EXISTS members_only BOOLEAN NOT NULL DEFAULT FALSE;
