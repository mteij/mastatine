-- The one definition of "member": an admin, an approved member, or a committee member, and never a banned account.
-- The site (lib/membership.ts) and the newsletter audience both call this, so they cannot drift apart.
CREATE OR REPLACE FUNCTION is_member(uid TEXT) RETURNS BOOLEAN
LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM "user" u
    WHERE u.id = uid AND NOT u.banned
      AND (u.role = 'admin' OR u.member_status = 'approved' OR EXISTS (SELECT 1 FROM committee_members m WHERE m.user_id = u.id))
  )
$$;
