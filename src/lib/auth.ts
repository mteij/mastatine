import { betterAuth } from "better-auth";
import { admin, magicLink } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";
import { requireEnv, siteUrl } from "@/lib/env";
import sql from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { changeEmailConfirmationEmail, changeEmailVerificationEmail, magicLinkEmail } from "@/lib/email-templates";
import { validateDisplayName } from "@/lib/profile";
import { allowMagicLinkFor } from "@/lib/magic-link-limit";
import { deleteSubscriberByEmail } from "@/lib/newsletter";
import { deleteAccountVotes } from "@/lib/voter-account";

const MAGIC_LINK_TTL_SECONDS = 10 * 60;
const CHANGE_EMAIL_TTL_SECONDS = 60 * 60;

declare global {
  var _authPool: Pool | undefined;
}

function adminEmails(): Set<string> {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

function createAuth() {
  const pool = (globalThis._authPool ??= new Pool({
    connectionString: requireEnv("DATABASE_URL"),
    max: 5,
  }));

  return betterAuth({
    appName: "S.A. Mastatine",
    baseURL: siteUrl(),
    secret: requireEnv("BETTER_AUTH_SECRET"),
    trustedOrigins: [siteUrl()],
    database: pool,
    session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
    emailVerification: {
      expiresIn: CHANGE_EMAIL_TTL_SECONDS,
      // Only used by the email change: sign-in links already prove an address, so accounts start verified.
      // This is the second step: the current address has already approved the change (see sendChangeEmailConfirmation).
      sendVerificationEmail: async ({ user, url }) => {
        await sendMail({ to: user.email, ...changeEmailVerificationEmail(url, CHANGE_EMAIL_TTL_SECONDS / 60) });
      },
    },
    user: {
      // The current address must approve first, so a stolen session cannot move the account to the thief's inbox.
      changeEmail: {
        enabled: true,
        sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
          await sendMail({ to: user.email, ...changeEmailConfirmationEmail(newEmail, url, CHANGE_EMAIL_TTL_SECONDS / 60) });
        },
      },
      deleteUser: {
        enabled: true, // requires a fresh session, so a stolen old cookie cannot erase an account
        afterDelete: async (user) => {
          await deleteSubscriberByEmail(user.email);
          await deleteAccountVotes(user.id);
        },
      },
    },
    advanced: {
      useSecureCookies: process.env.NODE_ENV === "production",
      // The route handler replaces this header with the address resolved by clientIp() (see api/auth/[...all]/route.ts).
      ipAddress: { ipAddressHeaders: ["x-forwarded-for"] },
    },
    rateLimit: {
      enabled: true,
      window: 60,
      max: 60,
      customRules: {
        "/sign-in/magic-link": { window: 60, max: 3 },
        "/magic-link/verify": { window: 60, max: 10 },
        "/change-email": { window: 3600, max: 5 },
      },
    },
    databaseHooks: {
      session: {
        create: {
          // Addresses added to ADMIN_EMAILS later are promoted at their next sign-in (the link proves the address is theirs).
          after: async (session) => {
            // Signing in is what keeps a membership from lapsing (see is_member).
            const [row] = await sql<{ email: string; role: string }[]>`UPDATE "user" SET last_active_at = NOW() WHERE id = ${session.userId} RETURNING email, role`;
            if (row && row.role !== "admin" && adminEmails().has(row.email.toLowerCase())) {
              await sql`UPDATE "user" SET role = 'admin' WHERE id = ${session.userId}`;
            }
          },
        },
      },
      user: {
        update: {
          // /api/auth/update-user is public: keep the display-name rules and refuse profile pictures we never show.
          before: async (data) => {
            const rest: Record<string, unknown> = { ...data };
            delete rest.image;
            if (typeof rest.name === "string") {
              const checked = validateDisplayName(rest.name);
              if ("error" in checked) return false;
              rest.name = checked.name;
            }
            return { data: rest };
          },
        },
        create: {
          // Users are only created once an emailed magic link is opened, so the address is verified.
          before: async (user) => ({
            data: { ...user, role: adminEmails().has(user.email.toLowerCase()) ? "admin" : "user" },
          }),
        },
      },
    },
    plugins: [
      magicLink({
        expiresIn: MAGIC_LINK_TTL_SECONDS,
        storeToken: "hashed",
        sendMagicLink: async ({ email, url }) => {
          // Silently skip when one address is being hammered; the caller always sees "check your email".
          if (!allowMagicLinkFor(email)) return;
          await sendMail({ to: email, ...magicLinkEmail(url, MAGIC_LINK_TTL_SECONDS / 60) });
        },
      }),
      admin({ defaultRole: "user", adminRoles: ["admin"] }),
      nextCookies(), // keep last
    ],
  });
}

type Auth = ReturnType<typeof createAuth>;
let instance: Auth | undefined;

/** Lazily created so `next build` does not need runtime secrets. */
export function getAuth(): Auth {
  return (instance ??= createAuth());
}
