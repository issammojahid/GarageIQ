# Railway Deployment Guide — GarageIQ API Server

## Why Railway Postgres Fails

The Replit internal `DATABASE_URL` (`postgresql://postgres:password@helium/heliumdb`) is a private
hostname unreachable from Railway. You need an **external** PostgreSQL database.

**Recommended (free, no credit card): [Neon](https://neon.tech)**

---

## Step 1 — Create a free Neon PostgreSQL database

1. Go to [neon.tech](https://neon.tech) → sign up (GitHub login works)
2. Create a new project → choose a region close to your Railway deployment region
3. In the project dashboard, copy the **Connection string** (looks like):
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

---

## Step 2 — Remove the failing Railway Postgres service

1. Open your Railway project dashboard
2. Click the **Postgres** service tile
3. Go to **Settings** → scroll to bottom → click **Delete service**
4. Confirm deletion

---

## Step 3 — Set environment variables on Railway

In your Railway project → click the **API Server** service → **Variables** tab → add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Paste the Neon connection string from Step 1 |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `NODE_ENV` | `production` |

> **PORT** is set automatically by Railway — do not set it manually.

---

## Step 4 — Run database migrations on Neon

Once the `DATABASE_URL` is set locally (or export it in terminal), push the schema:

```bash
# From the project root:
DATABASE_URL="postgresql://your-neon-connection-string" pnpm --filter @workspace/db run push
```

---

## Step 5 — Redeploy on Railway

Railway will automatically redeploy when you push to GitHub, or you can click
**Deploy** manually in the Railway dashboard.

The `railway.json` in this directory tells Railway exactly how to build and start the server:

- **Build**: `pnpm install --frozen-lockfile && pnpm --filter @workspace/api-server run build`
- **Start**: `pnpm --filter @workspace/api-server run start`

---

## Verify deployment

```bash
curl https://workspaceapi-server-production-02f4.up.railway.app/health
```

Expected: `{"status":"ok"}`
