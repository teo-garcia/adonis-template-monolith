<div align="center">

# AdonisJS Template Monolith

**Production-ready AdonisJS API monolith with Lucid, PostgreSQL, Redis, health
checks, metrics, and a sample tasks module**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node-24+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-10+-F69220?logo=pnpm&logoColor=white)](https://pnpm.io)
[![AdonisJS](https://img.shields.io/badge/AdonisJS-6-5A45FF)](https://adonisjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18+-4169E1?logo=postgresql&logoColor=white)](https://postgresql.org)

Part of the [@teo-garcia/templates](https://github.com/teo-garcia/templates)
ecosystem

</div>

---

## Features

| Category          | Technologies                                                         |
| ----------------- | -------------------------------------------------------------------- |
| **Framework**     | AdonisJS 6 with TypeScript-first bootstrapping                       |
| **Database**      | Lucid ORM with PostgreSQL migrations                                 |
| **Cache**         | Redis connectivity and readiness checks                              |
| **Observability** | Health endpoints, lightweight Prometheus metrics, structured logging |
| **Validation**    | Vine validators for request payloads                                 |
| **Testing**       | Japa functional test suite with Adonis test utils                    |
| **Code Quality**  | ESLint, Prettier, Husky, commitlint                                  |
| **DevOps**        | Docker, Docker Compose, Renovate                                     |

---

## Requirements

- Node.js 24+
- pnpm 10+
- Docker and Docker Compose
- PostgreSQL
- Redis

---

## Quick Start

```bash
pnpm install
cp .env.example .env
cp .env.test.example .env.test
node ace generate:key
docker compose up -d db redis
pnpm db:migrate
pnpm dev
```

The app starts on `http://localhost:3333` and the sample API lives under `/api`.

---

## Scripts

| Command                | Description                          |
| ---------------------- | ------------------------------------ |
| `pnpm dev`             | Start the Adonis dev server with HMR |
| `pnpm build`           | Create a standalone production build |
| `pnpm start`           | Run the TypeScript server entrypoint |
| `pnpm start:prod`      | Run the compiled production server   |
| `pnpm test`            | Run all Japa suites                  |
| `pnpm test:functional` | Run the functional API suite         |
| `pnpm lint:es`         | Lint and fix with ESLint             |
| `pnpm lint:ts`         | TypeScript type checking             |
| `pnpm format`          | Format with Prettier                 |
| `pnpm db:migrate`      | Run pending Lucid migrations         |
| `pnpm db:rollback`     | Roll back the latest migration batch |
| `pnpm db:reset`        | Refresh the schema from scratch      |
| `pnpm db:status`       | Show migration status                |

---

## Health and Observability

| Endpoint            | Description                                   |
| ------------------- | --------------------------------------------- |
| `GET /health/live`  | Liveness probe                                |
| `GET /health/ready` | Readiness probe (checks PostgreSQL + Redis)   |
| `GET /health`       | Full health report with runtime diagnostics   |
| `GET /metrics`      | Prometheus-style request counters and timings |

---

## Environment Variables

| Variable          | Description                 | Default                 |
| ----------------- | --------------------------- | ----------------------- |
| `HOST`            | HTTP host                   | `localhost`             |
| `PORT`            | Application port            | `3333`                  |
| `APP_KEY`         | App encryption key          | Required                |
| `API_PREFIX`      | API route prefix            | `api`                   |
| `DB_HOST`         | PostgreSQL host             | `localhost`             |
| `DB_PORT`         | PostgreSQL port             | `5432`                  |
| `DB_DATABASE`     | PostgreSQL database         | `adonis_monolith`       |
| `REDIS_HOST`      | Redis host                  | `localhost`             |
| `REDIS_PORT`      | Redis port                  | `6379`                  |
| `CORS_ORIGIN`     | Allowed frontend origin     | `http://localhost:3000` |
| `METRICS_ENABLED` | Enable the metrics endpoint | `true`                  |

See `.env.example` and `.env.test.example` for the full set.

---

## Project Structure

| Path                   | Purpose                                              |
| ---------------------- | ---------------------------------------------------- |
| `app/controllers/`     | HTTP controllers for health, metrics, and tasks      |
| `app/services/`        | Business logic and readiness/metrics services        |
| `app/models/`          | Lucid models                                         |
| `app/validators/`      | Vine request validators                              |
| `config/`              | Adonis app, database, redis, logger, and CORS config |
| `start/`               | Route and kernel bootstrap                           |
| `database/migrations/` | Lucid migrations                                     |
| `tests/functional/`    | Japa API regression coverage                         |
| `docker/`              | Development and production container files           |

---

## Shared Governance

| Area               | Tooling                                             |
| ------------------ | --------------------------------------------------- |
| Dependency updates | Renovate                                            |
| Issue intake       | GitHub issue templates                              |
| Change review      | Pull request template                               |
| CI                 | GitHub Actions for lint, typecheck, build, and test |
| Security           | Trivy and `pnpm audit`                              |

---

## Related Templates

| Template                    | Description      |
| --------------------------- | ---------------- |
| `nest-template-monolith`    | NestJS backend   |
| `fastapi-template-monolith` | FastAPI backend  |
| `django-template-monolith`  | Django backend   |
| `react-template-next`       | Next.js frontend |

---

## Notes

- This template is aligned with current AdonisJS app bootstrapping and Ace/Lucid
  commands, while keeping the repo’s existing monolith conventions for Docker,
  health checks, metrics, and sample domain structure.

---

## License

MIT

---

<div align="center">
  <sub>Built by <a href="https://github.com/teo-garcia">teo-garcia</a></sub>
</div>
