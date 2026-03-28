#!/bin/sh
set -x

echo "=== Running DB migration ==="
cd /app/lib/db && pnpm run push-force || echo "Warning: migration skipped or failed, continuing"

echo "=== Starting API server ==="
exec node --enable-source-maps /app/artifacts/api-server/dist/index.mjs
