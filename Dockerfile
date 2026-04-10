FROM node:22-slim AS builder
WORKDIR /app
RUN npm install -g pnpm@10
COPY . .
RUN pnpm install --no-frozen-lockfile
RUN cd /app/artifacts/api-server && node build.mjs

FROM node:22-slim AS runtime
WORKDIR /app
RUN npm install -g pnpm@10
COPY --from=builder /app .
RUN chmod +x /app/start.sh
CMD ["/app/start.sh"]
