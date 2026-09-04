# ================================
# Build Stage
# ================================
FROM node:24-alpine AS builder

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

# ================================
# Production Stage
# ================================
FROM node:24-alpine AS production

RUN apk add --no-cache dumb-init
RUN corepack enable
RUN addgroup -g 1001 -S nodejs && adduser -S adonis -u 1001

WORKDIR /app

COPY --from=builder /app/build ./
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

RUN pnpm install --prod --frozen-lockfile --ignore-scripts

USER adonis

EXPOSE 3333

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3333/health/live').then((r) => process.exit(r.status === 200 ? 0 : 1)).catch(() => process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "bin/server.js"]
