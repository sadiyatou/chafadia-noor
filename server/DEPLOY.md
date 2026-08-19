# Deploying the backend so two real devices can talk over the internet

Two phones on different Wi-Fi/cellular networks can only chat, call, or see
admin content if the backend in `server/` is reachable at a public URL —
`localhost` and your home LAN IP only work for devices on the same network
as your computer. This is a one-time setup. **Render's free tier** is used
below because it needs no credit card for a small Postgres + web service,
but Railway/Fly.io work the same way.

## 1. Create the database

1. Go to https://dashboard.render.com → **New → PostgreSQL**.
2. Any name/region, free plan. Wait for it to become "Available".
3. Copy the **Internal Database URL** (or External, if connecting from
   outside Render) — this is your `DATABASE_URL`.

## 2. Create the web service

1. Push this repo to a GitHub repository if it isn't already (the server/
   folder needs to be visible to Render — either the whole repo or a repo
   rooted at `server/`).
2. Render dashboard → **New → Web Service** → connect the repo.
3. **Root Directory**: `server` (if deploying the whole monorepo) or leave
   blank if the repo root is already `server/`.
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`
6. Under **Environment**, add:
   - `DATABASE_URL` = the value from step 1
   - `JWT_SECRET` = any long random string (e.g. generate with
     `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   - `PORT` = `10000` (Render's default; the app reads `process.env.PORT`)
   - `ANTHROPIC_API_KEY` = your key from https://console.anthropic.com (optional —
     the AI agent falls back to canned answers without it)
   - `TURN_URLS` / `TURN_USERNAME` / `TURN_CREDENTIAL` = optional, for more
     reliable calls across strict NATs (see below)
7. Deploy. Render gives you a public URL like `https://chafadia-noor-api.onrender.com`.

## 3. Run migrations once

From your machine, with `DATABASE_URL` pointed at the same database (use the
**External** connection string if running this from outside Render):

```bash
cd server
DATABASE_URL="<external-database-url>" npm run migrate
```

This applies all files in `server/migrations/` in order and is safe to
re-run — already-applied migrations are tracked and skipped.

## 4. Point the app at the deployed backend

In the app root, copy `.env.example` to `.env` and set:

```
EXPO_PUBLIC_API_URL=https://chafadia-noor-api.onrender.com
EXPO_PUBLIC_SOCKET_URL=https://chafadia-noor-api.onrender.com
```

Rebuild/restart Expo (`npx expo start -c`) so the env var is picked up —
`EXPO_PUBLIC_*` vars are inlined at build time, not read at runtime.

Do the same for the admin panel: copy `admin/.env.example` to `admin/.env`
and set `VITE_API_URL=https://chafadia-noor-api.onrender.com/api` before
deploying the admin panel anywhere but your own machine (rebuild with
`npm run build` afterward — Vite env vars are inlined at build time too).

## Notes on reliability

- **Render's free web service sleeps after inactivity** and takes ~30–60s to
  wake on the next request/socket connection — fine for testing, not for a
  production launch. Upgrade to a paid instance (or use Railway/Fly) once
  you're ready to launch for real.
- **Calls need a TURN server for strict NATs.** Public STUN (used by default)
  is enough for many home/mobile networks but not all — carrier-grade NAT or
  strict corporate firewalls will fail to connect without TURN. A free way to
  get one is Twilio's STUN/TURN service, or self-host `coturn`. Once you have
  credentials, set `TURN_URLS`/`TURN_USERNAME`/`TURN_CREDENTIAL` in the
  server environment.
