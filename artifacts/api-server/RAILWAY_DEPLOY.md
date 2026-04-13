# Railway Deployment Guide — GarageIQ API Server

## Current Setup

- **Database**: Neon PostgreSQL (AWS US East 1, pooler endpoint)
- **Host**: ep-divine-boat-am956uda-pooler.c-5.us-east-1.aws.neon.tech
- **Schema**: All tables created via drizzle-kit push ✅

---

## Environment Variables (set in Railway → API service → Variables)

| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon connection string (pooler endpoint, sslmode=require) |
| `OPENAI_API_KEY` | OpenAI API key |
| `NODE_ENV` | `production` |
| `PORT` | *(leave unset — Railway sets automatically)* |

---

## Build & Start (railway.json)

- **Build**: `pnpm install --frozen-lockfile && pnpm --filter @workspace/api-server run build && pnpm --filter @workspace/db run push`
- **Start**: `pnpm --filter @workspace/api-server run start`

Drizzle schema push runs automatically on every deploy.

---

## Verify deployment

```bash
curl https://workspaceapi-server-production-02f4.up.railway.app/health
```
