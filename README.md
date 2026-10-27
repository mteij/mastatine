# S.A. Mastatine

Next.js 16 (App Router) + PostgreSQL on [Bun](https://bun.sh), self-hosted with Docker Compose.

## Run locally

```bash
bun install
bun run db:dev        # starts Postgres in Docker on 127.0.0.1:5432 and applies the migrations
bun run dev           # http://localhost:3000
```

`.env.local` needs `DATABASE_URL`, `SITE_URL` and `BETTER_AUTH_SECRET` (see `.env.example`). Without Docker, point
`DATABASE_URL` at any Postgres and run `bun run db:migrate`. With `MAIL_TRANSPORT=log` sign-in emails are printed
in the dev server's terminal instead of being sent. Set `ADMIN_EMAILS` to get the admin role on first sign-in.

`dev` deliberately runs on Node: Next's dev tooling is not fully supported on Bun's runtime (slow, noisy
source-map errors). Production builds and the Docker image run on Bun.

## Deploy to the VPS

```bash
git clone <repo> && cd mastatine
cp .env.example .env     # fill in every value; compose refuses to start without the required ones
docker compose up -d --build
```

Migrations run automatically on every container start. The app listens on `127.0.0.1:3000`; point your existing reverse
proxy at it and make sure it **overwrites** `X-Forwarded-For` (rate limits trust it) and sets `Host`. Example Caddy block:

```
mastatine.nl {
    reverse_proxy 127.0.0.1:3000
}
```

Data lives in named volumes: `pgdata` (database), `uploads` (tower photos) and `imgcache`. Back up the first two.

### First admin

Put your address in `ADMIN_EMAILS`, open `/login`, request a link and click it. Addresses on that list get the admin
role the first time they sign in (never before the emailed link is opened). Admins see `/admin`.

### Email (Purelymail)

Sign-in links and the newsletter are sent over SMTP (`SMTP_*`, `MAIL_FROM` in `.env`). Before the first send:

- Add the **SPF, DKIM and DMARC** DNS records Purelymail shows for your domain, and check reverse DNS is not needed (you send via their servers).
- Send yourself a test issue from the admin newsletter page and read the headers (`dkim=pass`, `spf=pass`).
- Check Purelymail's terms and sending limits for bulk mail; `NEWSLETTER_RATE_PER_MIN` (default 60) throttles delivery.

### Newsletter

`/admin/newsletter`: write an issue, **Send test to me**, then **Send**. Subscribers must confirm by email (double opt-in)
and every message carries a signed one-click unsubscribe link (also exposed as `List-Unsubscribe` headers). Delivery is
logged per recipient, so an interrupted send is resumed with the same button and never duplicates.

### Site structure

Every page shares one layout (`src/app/layout.tsx`): the sidebar and footer from the original homepage design
(`src/classic`). The homepage is `src/app/page.tsx`; all other pages live in `src/app/(pages)` and render inside a white
panel on the orange background. The original stylesheet sits in a low-priority CSS layer in `src/app/globals.css`, below
the Tailwind utilities, so utility classes always win over its global element rules. Editorial text lives in `src/content/`.

### Migrating from Supabase (one-off)

With the stack running, from a machine that can reach both databases (the Postgres port is not published; run it inside the app container or temporarily publish it):

```bash
docker compose cp scripts/migrate-from-supabase.mjs app:/app/migrate.mjs
docker compose exec -e SOURCE_DATABASE_URL=... -e TARGET_DATABASE_URL=postgresql://mastatine:$POSTGRES_PASSWORD@db:5432/mastatine app bun migrate.mjs
```

It copies towers and votes and downloads every image into the `uploads` volume. Re-running is safe.

### Updating

```bash
git pull && docker compose up -d --build
```
