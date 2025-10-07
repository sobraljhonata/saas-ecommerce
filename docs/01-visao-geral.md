# 1. Visão Geral

## Objetivo
Reescrever um E-Commerce SaaS 2017 (CQRS/DDD/TDD, .NET + AngularJS) para **microsserviços** em **Node.js + React**, mantendo **CQRS, DDD e TDD**, com **SAGA orquestrada** em Kafka.

## Arquitetura em alto nível
- **Orchestrator**: core do fluxo SAGA (orquestra Inventory → Payment → Shipping → Order).
- **svc-order**: aceita pedidos e publica `OrderPlaced` (via Outbox).
- **svc-inventory**: reserva/libera estoque.
- **svc-payment**: autoriza/estorna pagamentos (configurável via `REJECT_OVER`).
- **svc-shipping**: prepara expedição.
- **packages/shared-kafka**: `createKafka`, `Topics`, tipos de envelope.
- **packages/shared-config**: validação/env.

### Persistência
- **MySQL/Prisma**: dados relacionais (ex.: catálogo, pedidos).
- **MongoDB**: `order_history` (linha do tempo do pedido).
- **Redis**: idempotência (dedupe de mensagens/etapas).
- **Kafka**: backbone de eventos/comandos.

### Infra
- `docker-compose.infra.yml`: Kafka/ZooKeeper, Redis, Mongo, MySQL (com **volumes**).
- `docker-compose.apps.yml`: todos os serviços Node dentro do cluster Docker.
- `docker-compose.e2e.yml`: runner do teste E2E em Python (sem dependência local).

- Host (pnpm dev) <-> kafka: localhost:29092
- Containers entre si <-> kafka: kafka:9092

## Padrões
- **SAGA orquestrada** (Orchestrator como orquestrador).
- **Outbox** pattern (serviços publicam no tópico Outbox).
- **Idempotência** no consumidor Kafka + por etapa no Router.
- **Versionamento de eventos** por _type_ e namespace de tópico (v1).

