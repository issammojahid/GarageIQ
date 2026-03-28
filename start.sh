#!/bin/sh
set -ex

echo "=== Running DB migration ==="
cd /app
pnpm --filter @workspace/db run push-force

echo "=== Starting API server ==="
exec node --enable-source-maps /app/artifacts/api-server/dist/index.mjs
