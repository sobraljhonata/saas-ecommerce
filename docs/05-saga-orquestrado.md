# 5. SAGA Orquestrada

## Fluxo "feliz"
1. `OrderPlaced` (Outbox) → **Orchestrator** → `inventory.v1.commands.reserve`
2. `InventoryReserved` → **Orchestrator** → `payment.v1.commands.authorize`
3. `PaymentAuthorized` → **Orchestrator** → `shipping.v1.commands.prepare`
4. `ShippingPrepared` → **Orchestrator** → `order.v1.commands.confirm` (ou `order.v1.events.confirmed`)

## Compensações
- **PaymentFailed** → Orchestrator:
  - `inventory.v1.commands.release`
  - `order.v1.events.failed`
- **ShippingFailed** → Orchestrator:
  - `payment.v1.commands.refund`
  - `order.v1.events.failed`
- **InventoryReservationFailed** → Orchestrator:
  - `order.v1.events.failed`

## Idempotência
- **Consumer** (Kafka → Orchestrator): dedupe por `messageId` (ou hash do payload) em **Redis** por 300s.
- **Por etapa** (RouterService): chave `saga:step:{orderId}:{step}`, TTL 10 min.

## Linha do tempo (Mongo)
- Collection: `order_history`
- Documento: `{ orderId, stages: [{ stage, at, payload }] }`
