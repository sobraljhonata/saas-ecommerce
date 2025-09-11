# SaaS Commerce Monorepo (Bootstrap)

Stack:
- Node.js 22 + TypeScript
- NestJS (Fastify) + CQRS
- Prisma (MySQL)
- Kafka (producers/consumers placeholders)
- Redis + Mongo (placeholders for future services)
- Test: Jest + ts-jest + @testcontainers/* (suggested)
- Monorepo: Turborepo + pnpm

## Quickstart

```bash
# 1) Instale turbo e deps
pnpm i -g turbo
pnpm i

# 2) Suba MySQL + Kafka
docker compose -f infra/docker-compose.yml up -d mysql zookeeper kafka

# 3) Configure env do svc-catalog
cp apps/svc-catalog/.env.example apps/svc-catalog/.env

# 4) Prisma (gerar client e migrar)
pnpm -F svc-catalog prisma:generate
pnpm -F svc-catalog prisma:migrate

# 5) Dev do svc-catalog
pnpm -F svc-catalog dev
```

Services included now:
- `apps/svc-catalog`: CreateProduct (CQRS) minimal path with Outbox draft.

Next steps:
- Implement orchestrator, discounts, customers, orders, sales, CMS, social.
```

