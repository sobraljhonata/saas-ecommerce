## Healthchecks (sugestão)
- HTTP `/health` em cada serviço (liveness/readiness).
- Kafka Admin check na inicialização (criar/validar tópicos em dev).

## Logs
- NestJS logger em `info`.
- Para debug de SAGA: logar `topic + type + orderId` no publish/consume.

## Métricas (sugestão)
- Expor Prometheus: contadores de mensagens processadas por tópico, tempos por etapa da SAGA, erros.
- Alertas: falhas seguidas em `payment`, aumento de `release` no `inventory`, falhas de shipping.

## Backpressure
- `kafkajs` com `maxBytesPerPartition`, `maxInFlightRequests` configuráveis se necessário.
