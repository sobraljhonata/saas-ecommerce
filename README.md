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
pnpm i -g turbo
pnpm i

# Start MySQL and Kafka locally
docker compose up -d mysql zookeeper kafka

# Generate Prisma client for Catalog service
pnpm -F svc-catalog prisma:generate

# Migrate DB
pnpm -F svc-catalog prisma:migrate

# Dev
pnpm -F svc-catalog dev

# Test
pnpm -F svc-catalog test
```

Services included now:
- `apps/svc-catalog`: CreateProduct (CQRS) minimal path with Outbox draft.

Next steps:
- Implement orchestrator, discounts, customers, orders, sales, CMS, social.
```

