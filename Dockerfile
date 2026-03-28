FROM node:22-slim AS builder
WORKDIR /app
RUN npm install -g pnpm@10
COPY . .
RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @workspace/api-server run build

FROM node:22-slim AS runtime
WORKDIR /app
RUN npm install -g pnpm@10
COPY --from=builder /app .
EXPOSE 8080
CMD ["/bin/sh", "-c", "pnpm --filter @workspace/db run push-force && pnpm --filter @workspace/api-server run start"]
