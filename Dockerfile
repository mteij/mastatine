# syntax=docker/dockerfile:1
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM oven/bun:1 AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# NEXT_PUBLIC_* values are inlined at build time.
ARG NEXT_PUBLIC_SHOP_URL
ENV NEXT_PUBLIC_SHOP_URL=$NEXT_PUBLIC_SHOP_URL
RUN bun --bun next build

FROM oven/bun:1-slim AS runner
WORKDIR /app
ENV NODE_ENV=production     NEXT_TELEMETRY_DISABLED=1     PORT=3000     HOSTNAME=0.0.0.0     UPLOAD_DIR=/data/uploads
RUN mkdir -p /data/uploads /app/.next/cache && chown -R bun:bun /data /app
COPY --from=build --chown=bun:bun /app/.next/standalone ./
COPY --from=build --chown=bun:bun /app/.next/static ./.next/static
COPY --from=build --chown=bun:bun /app/public ./public
# next/image needs sharp's native libvips build; standalone tracing doesn't reliably include it.
COPY --from=deps --chown=bun:bun /app/node_modules/sharp ./node_modules/sharp
COPY --from=deps --chown=bun:bun /app/node_modules/@img ./node_modules/@img
COPY --from=deps --chown=bun:bun /app/node_modules/detect-libc ./node_modules/detect-libc
COPY --from=deps --chown=bun:bun /app/node_modules/semver ./node_modules/semver
# Migrations run on every start (idempotent); the runner needs the `postgres` client, which the
# standalone bundle inlines and therefore does not ship.
COPY --from=build --chown=bun:bun /app/db/migrations ./db/migrations
COPY --from=build --chown=bun:bun /app/scripts/migrate.mjs ./scripts/migrate.mjs
COPY --from=deps --chown=bun:bun /app/node_modules/postgres ./node_modules/postgres
USER bun
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s   CMD bun -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["sh", "-c", "bun scripts/migrate.mjs && exec bun server.js"]
