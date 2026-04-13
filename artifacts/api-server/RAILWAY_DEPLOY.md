# Railway Deployment Guide — GarageIQ API Server

## Step 1 — Get your DATABASE_URL from Replit

Run this command in the Replit shell to print your database connection string:

```bash
echo $DATABASE_URL
```

Copy the full output. It will look like:
```
postgresql://postgres:<password>@<host>/<database>?sslmode=disable
```

---

## Step 2 — Remove the failing Railway Postgres service

1. Open your Railway project dashboard
2. Click the **Postgres** service tile
3. Go to **Settings** → scroll to bottom → click **Delete service**
4. Confirm deletion

---

## Step 3 — Set environment variables in Railway

Go to Railway → your **API Server** service → **Variables** tab → add these exact variables:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Paste the value from Step 1 |
| `OPENAI_API_KEY` | Your OpenAI API key (same as in Replit Secrets) |
| `NODE_ENV` | `production` |
| `PORT` | *(leave unset — Railway sets this automatically)* |

---

## Step 4 — Redeploy on Railway

Railway auto-deploys on GitHub push. You can also click **Deploy** manually in the dashboard.

The `railway.json` in this directory tells Railway how to build and start:

- **Build**: `pnpm install --frozen-lockfile && pnpm --filter @workspace/api-server run build`
- **Start**: `pnpm --filter @workspace/api-server run start`

---

## Verify deployment

```bash
curl https://workspaceapi-server-production-02f4.up.railway.app/health
```
