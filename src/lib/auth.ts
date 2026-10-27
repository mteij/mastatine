import { betterAuth } from "better-auth";
import { admin, magicLink } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";
import { requireEnv, siteUrl } from "@/lib/env";
import { sendMail } from "@/lib/mailer";
import { magicLinkEmail } from "@/lib/email-templates";
import { allowMagicLinkFor } from "@/lib/magic-link-limit";
import { deleteSubscriberByEmail } from "@/lib/newsletter";

const MAGIC_LINK_TTL_SECONDS = 10 * 60;

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
    user: {
      deleteUser: {
        enabled: true, // requires a fresh session, so a stolen old cookie cannot erase an account
        afterDelete: async (user) => deleteSubscriberByEmail(user.email),
      },
    },
    advanced: {
      useSecureCookies: process.env.NODE_ENV === "production",
      // Requires the reverse proxy to overwrite (not append to) X-Forwarded-For.
      ipAddress: { ipAddressHeaders: ["x-forwarded-for"] },
    },
    rateLimit: {
      enabled: true,
      window: 60,
      max: 60,
      customRules: {
        "/sign-in/magic-link": { window: 60, max: 3 },
        "/magic-link/verify": { window: 60, max: 10 },
      },
    },
    databaseHooks: {
      user: {
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
