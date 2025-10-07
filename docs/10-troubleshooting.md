# 10. Troubleshooting

## Kafka — Unknown topic or partition
- Crie os tópicos (dev): job `topics-init` ou script Admin.
- Confirme o **bootstrap** correto: host=localhost:29092 (host) ou kafka:9092 (containers).

## DNS `getaddrinfo ENOTFOUND kafka`
- Serviço Node fora do Docker tentando resolver `kafka`. Use `localhost:29092`.

## Prisma — `Property 'product' does not exist on type 'PrismaService'`
- Geração do client ausente/errada. Garanta `import { PrismaClient } from '../../generated/client'` (ou `@prisma/client`) conforme o app e rode `prisma generate`.
- Separe `tsconfig.build.json` para excluir `test/`.

## TS2531 — `Object is possibly 'null'` em consumers/producers
- Use variável local após criação: `const consumer = (this.consumer = kafka.consumer(...)); await consumer.connect(); ...`

## Injecão Nest — `Can't resolve dependencies`
- Adicione o **módulo** do provider nos `imports` (ex.: `IdempotencyModule` no `KafkaModule`).
- Exporte o provider no módulo de origem (ex.: `exports: [IdempotencyService]`).

## Dedupe/Idempotência “engolindo” mensagem
- Limpe Redis (`FLUSHDB`) em dev ou use `orderId` novo.
- Ajuste TTLs conforme necessidade.

## TS6059 — `test/` sob rootDir no build
- `tsconfig.build.json`: `exclude: ["test", "dist", "**/*.spec.ts"]`.
