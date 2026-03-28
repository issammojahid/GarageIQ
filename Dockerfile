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
RUN chmod +x /app/start.sh
EXPOSE 8080
CMD ["/app/start.sh"]
