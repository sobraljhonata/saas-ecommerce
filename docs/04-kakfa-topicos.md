# 4. Kafka — Tópicos

## Convenção
- `*.v1.commands.*` → comandos
- `*.v1.events.*`   → eventos
- `outbox.v1.events` → outbox geral

## Lista (v1)
- `outbox.v1.events`
- `inventory.v1.commands.reserve` / `inventory.v1.commands.release`
- `inventory.v1.events.reserved` / `inventory.v1.events.released` / `inventory.v1.events.failed`
- `payment.v1.commands.authorize` / `payment.v1.commands.refund`
- `payment.v1.events.authorized` / `payment.v1.events.failed` / `payment.v1.events.refunded`
- `shipping.v1.commands.prepare`
- `shipping.v1.events.prepared` / `shipping.v1.events.failed`
- `order.v1.commands.confirm`
- `order.v1.events.confirmed` / `order.v1.events.failed`

## Criação automática
- Em dev, `docker-compose.infra.yml` habilita `KAFKA_CFG_AUTO_CREATE_TOPICS_ENABLE=true`.
- Além disso, existe o job `topics-init` (em `docker-compose.apps.yml`) que cria/garante todos via Admin API.

## Observação
- Em produção, **desabilite auto-create** e gerencie os tópicos via infraestrutura (IaC).
