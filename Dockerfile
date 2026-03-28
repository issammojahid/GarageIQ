FROM node:22-slim

WORKDIR /app

RUN npm install -g pnpm@10

COPY . .

RUN pnpm install --no-frozen-lockfile

RUN pnpm --filter @workspace/api-server run build

EXPOSE 8080

CMD ["/bin/sh", "-c", "pnpm --filter @workspace/db run push-force && pnpm --filter @workspace/api-server run start"]
