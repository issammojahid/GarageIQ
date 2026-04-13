# Railway Deployment Guide — GarageIQ API Server

## Current Replit DATABASE_URL

To get your current database connection string from the Replit environment, run:

```bash
echo $DATABASE_URL
```

> **Important**: The Replit-provisioned PostgreSQL runs on an internal hostname (`helium`)
> that is **not reachable from external services like Railway**.
> The URL will look like: `postgresql://postgres:password@helium/heliumdb?sslmode=disable`
> This URL cannot be used directly in Railway — you need an externally accessible database.

---

## Recommended External DB: Neon (free, no credit card)

### Step 1 — Create a Neon PostgreSQL database

1. Go to [neon.tech](https://neon.tech) → sign up (GitHub login works)
2. Create a new project → choose a region close to your Railway region
3. Copy the **Connection string** (e.g.):
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### Step 2 — Remove the failing Railway Postgres service

1. Open your Railway project dashboard
2. Click the **Postgres** service tile
3. Go to **Settings** → scroll to bottom → click **Delete service**
4. Confirm deletion

### Step 3 — Set environment variables in Railway

Go to Railway → your **API Server** service → **Variables** tab → add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Paste the Neon connection string from Step 1 |
| `OPENAI_API_KEY` | Your OpenAI API key (same as Replit secret) |
| `NODE_ENV` | `production` |

> **PORT** is set automatically by Railway — do not set it manually.

### Step 4 — Push the database schema to Neon

Run from the project root (replace with your actual Neon URL):

```bash
DATABASE_URL="postgresql://your-neon-url/neondb?sslmode=require" pnpm --filter @workspace/db run push
```

### Step 5 — Redeploy on Railway

Railway auto-deploys on GitHub push. The `railway.json` in this directory configures:

- **Build**: `pnpm install --frozen-lockfile && pnpm --filter @workspace/api-server run build`
- **Start**: `pnpm --filter @workspace/api-server run start`

You can also click **Deploy** manually in the Railway dashboard.

---

## Verify deployment

```bash
curl https://workspaceapi-server-production-02f4.up.railway.app/health
```
