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
cp .env.example .env           # set POSTGRES_PASSWORD (and NEXT_PUBLIC_SHOP_URL)
docker compose up -d --build
```

The app listens on `127.0.0.1:3000`; point your existing reverse proxy at it. Example Caddy block:

```
mastatine.nl {
    reverse_proxy 127.0.0.1:3000
}
```

Data lives in two named volumes: `pgdata` (database) and `uploads` (tower photos). Back up both.

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
