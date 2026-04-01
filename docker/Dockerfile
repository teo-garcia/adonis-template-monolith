# ================================
# Build Stage
# ================================
FROM node:24-alpine AS builder

RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

WORKDIR /app

COPY package.json ./

RUN pnpm install --no-frozen-lockfile

COPY . .

ENV NODE_ENV=production \
  HOST=0.0.0.0 \
  PORT=3333 \
  APP_KEY=build-only-adonis-app-key \
  APP_NAME="AdonisJS Monolith Template" \
  APP_VERSION=1 \
  API_PREFIX=/api \
  LOG_LEVEL=info \
  DB_CONNECTION=postgres \
  DB_HOST=localhost \
  DB_PORT=5432 \
  DB_USER=postgres \
  DB_PASSWORD=postgres \
  DB_DATABASE=adonis_monolith \
  DB_DEBUG=false \
  REDIS_HOST=localhost \
  REDIS_PORT=6379 \
  REDIS_PASSWORD= \
  REDIS_DB=0 \
  CORS_ENABLED=true \
  CORS_ORIGIN=http://localhost:3000 \
  METRICS_ENABLED=true

RUN pnpm build

# ================================
# Production Stage
# ================================
FROM node:24-alpine AS production

RUN apk add --no-cache dumb-init
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate
RUN addgroup -g 1001 -S nodejs && adduser -S adonis -u 1001

WORKDIR /app

COPY --from=builder /app/build ./

RUN pnpm install --prod --no-frozen-lockfile

USER adonis

EXPOSE 3333

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:3333/health/live').then((r) => process.exit(r.status === 200 ? 0 : 1)).catch(() => process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "bin/server.js"]
