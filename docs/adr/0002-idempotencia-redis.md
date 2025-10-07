# ADR-0002: Idempotência com Redis

- **Status**: Aceito
- **Data**: 2025-09-xx

## Contexto
Kafka pode reentregar mensagens; precisamos evitar efeitos colaterais duplicados.

## Decisão
- Dedupe por mensagem no consumer (Redis `saga:msg:{id/hash}`).
- Dedupe por etapa no Router (Redis `saga:step:{orderId}:{step}`).

## Consequências
- + Segurança contra reentregas
- – Requer Redis disponível e tuning de TTLs
