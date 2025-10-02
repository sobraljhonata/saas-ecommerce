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
docker compose -f infra/docker-compose.yml up -d zookeeper kafka mysql mongo redis

pnpm -F orchestrator dev
pnpm -F svc-order dev
pnpm -F svc-inventory dev

rm -rf apps/svc-order/src/generated
pnpm -F svc-order prisma:generate
pnpm -F svc-order build

# 3) Configure env do svc-catalog
cp apps/svc-catalog/.env.example apps/svc-catalog/.env

# garantir versões de prisma alinhadas no service
pnpm -F svc-catalog add -D prisma@5.18.0
pnpm -F svc-catalog add @prisma/client@5.18.0

# 4) Prisma (gerar client e migrar)
pnpm -F svc-catalog prisma:generate
pnpm -F svc-catalog prisma:migrate

pnpm -F svc-catalog exec prisma generate
pnpm -F svc-catalog exec prisma migrate dev --name init

pnpm -F svc-order exec prisma generate
pnpm -F svc-order exec prisma migrate dev --name init

# 5) Dev do svc-catalog
pnpm -F svc-catalog dev
```
```bash
Services included now:
- `apps/svc-catalog`: CreateProduct (CQRS) minimal path with Outbox draft.

Next steps:
- Implement orchestrator, discounts, customers, orders, sales, CMS, social.
```
```bash
curl -X POST http://localhost:3002/orders \
  -H "Content-Type: application/json" \
  -d '{
    "code":"PED9001",
    "tenantId":"22222222-2222-2222-2222-222222222222",
    "items":[{"productId":"11111111-1111-1111-1111-111111111111","quantity":2,"unitPrice":50,"total":100}]
  }'

```

```bash
docker exec -it $(docker ps -qf "ancestor=mongo:7") mongosh saas --quiet \
  --eval 'db.order_history.find().sort({_id:-1}).limit(1).pretty()'
```

pnpm dev:all para subir orchestrator + order + inventory + (payment + shipping).

pnpm kafka:topics para listar/inspecionar tópicos com kcat

```bash
node -e "
const {Kafka}=require('kafkajs');
(async()=>{
  const kafka=new Kafka({clientId:'topic-init',brokers:['localhost:29092']});
  const admin=kafka.admin(); await admin.connect();
  const topics=[
  'outbox.v1.events',
  'inventory.v1.commands.reserve','inventory.v1.commands.release',
  'inventory.v1.events.reserved','inventory.v1.events.released','inventory.v1.events.failed',
  'payment.v1.commands.authorize','payment.v1.commands.refund',
  'payment.v1.events.authorized','payment.v1.events.failed','payment.v1.events.refunded',
  'shipping.v1.commands.prepare',
  'shipping.v1.events.prepared','shipping.v1.events.failed',
  'order.v1.commands.confirm',
  'order.v1.events.confirmed','order.v1.events.failed',
  ];
  await admin.createTopics({topics:[...new Set(topics)].map(t=>({topic:t,numPartitions:1,replicationFactor:1})),waitForLeaders:true});
  console.log('ok'); await admin.disconnect();
})().catch(e=>{console.error(e);process.exit(1);});
"

docker compose -f docker-compose.infra.yml up -d

python -m venv .venv
. .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt

python e2e_saga_test.py --mode success --brokers localhost:29092 --mongo-url mongodb://localhost:27017 --mongo-db orchestrator

python e2e_saga_test.py --mode fail --brokers localhost:29092 --mongo-url mongodb://localhost:27017 --mongo-db orchestrator

python e2e_saga_test.py --mode both --brokers localhost:29092 --mongo-url mongodb://localhost:27017 --mongo-db orchestrator

redis-cli -u "${REDIS_URL:-redis://localhost:6379}" FLUSHDB

docker compose -f docker-compose.infra.yml -f docker-compose.apps.yml up -d --build

docker compose -f docker-compose.infra.yml -f docker-compose.apps.yml logs -f orchestrator

docker compose -f docker-compose.infra.yml -f docker-compose.apps.yml logs -f orchestrator

docker compose -f docker-compose.infra.yml -f docker-compose.apps.yml up -d --build svc-payment

# no host, com a infra+apps do compose (listeners já configurados)
python e2e_saga_test.py --mode both --brokers localhost:29092 --mongo-url mongodb://localhost:27017 --mongo-db orchestrator

docker compose -f ./infra/docker-compose.infra.yml -f ./infra/docker-compose.apps.yml up -d --build

docker compose -f ./infra/docker-compose.infra.yml -f ./infra/docker-compose.apps.yml -f ./infra/docker-compose.e2e.yml run --rm e2e

# Só sucesso
docker compose -f docker-compose.infra.yml -f docker-compose.apps.yml -f docker-compose.e2e.yml \
  run --rm -e E2E_MODE=success e2e

# Aumentar timeout por hop
docker compose -f ./infra/docker-compose.infra.yml -f ./infra/docker-compose.apps.yml -f ./infra/docker-compose.e2e.yml \
  run --rm -e E2E_MODE=both -e E2E_BROKERS=kafka:9092 -e E2E_MONGO_URL=mongodb://mongo:27017 \
  -e E2E_MONGO_DB=orchestrator e2e

docker compose -f docker-compose.infra.yml -f docker-compose.apps.yml logs -f orchestrator svc-payment svc-inventory svc-shipping

docker compose -f docker-compose.infra.yml -f docker-compose.apps.yml logs -f orchestrator svc-payment svc-inventory svc-shipping

