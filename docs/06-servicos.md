# 6. Serviços (apps)

## Orchestrator
- **Responsável**: coordenar SAGA, dedupe (Redis), timeline (Mongo).
- Consome: `outbox.v1.events`, `inventory.*.events.*`, `payment.*.events.*`, `shipping.*.events.*`
- Publica: `*.commands.*` e `order.v1.events.*`
- ENV principais: `KAFKA_BROKERS`, `MONGO_URL`, `MONGO_DB`, `REDIS_URL`

## svc-order
- Expõe criação de pedidos (ou publica direto Outbox).
- Persistência relacional via Prisma (MySQL).
- Outbox: publica `OrderPlaced`.

## svc-catalog
- CRUD de produto/categoria; Prisma/MySQL.
- Outbox (se aplicável) para mudança de catálogo.

## svc-inventory
- Consome `inventory.v1.commands.reserve/release`
- Publica `inventory.v1.events.reserved/released/failed`

## svc-payment
- Consome `payment.v1.commands.authorize/refund`
- Publica `payment.v1.events.authorized/failed/refunded`
- **Regra simplificada**: autoriza se `amount < REJECT_OVER`

## svc-shipping
- Consome `shipping.v1.commands.prepare`
- Publica `shipping.v1.events.prepared/failed`
