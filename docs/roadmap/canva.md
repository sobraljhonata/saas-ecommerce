# Série de Artigos — ECommerce SaaS (estilo SAGA orquestrada)

> Diário técnico, passo a passo, com TDD, DDD, Clean Architecture e SAGA orquestrada — inspirado no formato solicitado no chat **Desenvolvimento SAGA logística** e aplicado ao projeto **Reescrever eCommerce SaaS**.

---

## Visão da série

* **Objetivo**: documentar de forma periódica (semanal/quinzenal) as decisões, passos práticos e resultados do desenvolvimento do ECommerce SaaS, mantendo o estilo técnico-narrativo usado na POC logística SAGA.
* **Público-alvo**: devs full‑stack, arquitetos e estudantes avançados.
* **Tecnologias**: Node.js/NestJS, TypeScript, Kafka, Prisma, Postgres, MongoDB, Redis, Docker, Swagger/OpenAPI, Jest, pnpm workspaces.
* **Arquitetura**: microsserviços (svc-catalog, svc-inventory, svc-order/orchestrator, svc-payment, svc-notification), API Gateway, BFF (futuro), observabilidade (OTel + Prometheus + Grafana), segurança (JWT/RBAC, Rate Limiter, CORS, Helmet), documentação (Swagger), CI/CD (GitHub Actions), containers (Docker/Compose, futuramente K8s).

---

## Cadência editorial

* **Periodicidade**: 1 post por semana (recomendado) ou a cada grande marco técnico.
* **Formato**: artigos de 6–12 minutos de leitura, com *step-by-step*, diagramas, trechos de código e links para PRs/commits.
* **Linguagem**: Português (principal) + *Short English abstract*.

---

## Estrutura replicável de cada artigo

1. **Contexto & Problema** — qual dor técnica/negócio estamos resolvendo.
2. **Objetivos** — mensuráveis para o ciclo (ex.: “Cobertura >80% no módulo X”).
3. **Arquitetura & Decisões** — trade‑offs e diagrama(s) (Mermaid/UML).
4. **Passo a passo (TDD)** — Red → Green → Refactor, commits e comandos.
5. **Testes & Qualidade** — Jest, cobertura, testes de contrato/eventos.
6. **Observabilidade & Operação** — logs, métricas, tracing, health checks.
7. **Resultados** — métricas, screenshots (Swagger), payloads exemplo.
8. **Próximos passos** — backlog objetivo para o próximo artigo.
9. **Anexos** — links para PRs, commits, scripts e assets.
10. **English abstract** — 4–6 linhas.

> **Template pronto** (copiar e colar ao criar cada novo post):

### Título (SEO)

Subtítulo (1 linha convincente)

**Contexto & Problema**
...

**Objetivos (SMART)**

* [ ] ...

**Arquitetura & Decisões**

```mermaid
graph LR
  Client --> API_Gateway
  API_Gateway --> svc_catalog
  API_Gateway --> svc_order
  svc_order -->|events| Kafka
  Kafka --> svc_inventory
  Kafka --> svc_payment
  svc_payment --> svc_order
  svc_inventory --> svc_order
  svc_order --> svc_notification
```

**Passo a passo (TDD)**
**Red:** ...
**Green:** ...
**Refactor:** ...

**Testes & Qualidade**

* Comandos: `pnpm -r test -- --coverage`
* Meta: `>= 80%`

**Observabilidade & Operação**
...

**Resultados**

* Swagger: ...
* Métricas: ...

**Próximos passos**
...

**English abstract**
...

**Tags (Medium)**: nodejs, typescript, architecture, microservices, kafka, nestjs, tdd, ddd, saga, ecommerce
**CTA (LinkedIn/GitHub)**: “⚙️ Código e PRs no repositório”, “💬 Dúvidas? Comente no post”.

---

## Roadmap da série (12 partes sugeridas)

1. **Kickoff & Mapa de Contextos** — visão de produto, domínios e Bounded Contexts; arquitetura alvo; plano editorial.
2. **Monorepo & Workspaces (pnpm)** — estrutura de pastas, lint, tsconfig, scripts, *conventional commits*.
3. **Infra local com Docker** — Postgres, Mongo, Redis, Kafka/Zookeeper, Kafdrop, Prisma Studio, Nginx (gateway).
4. **Domain & Prisma Schemas (Catálogo)** — entidades `Product`, `Category`, migrações, *seed*.
5. **svc-catalog (HTTP + Swagger + TDD)** — repositório, casos de uso, controller, testes.
6. **svc-inventory (reserva/baixa)** — API + integração com Kafka (eventos de estoque).
7. **svc-order (orquestrador da SAGA)** — iniciar SAGA, *outbox*, idempotência, compensações.
8. **svc-payment (stub + ACL)** — simulação de pagamentos, timeouts, compensações.
9. **svc-notification** — templates, e‑mail/whatsapp (mock), fan‑out a partir de eventos.
10. **Observability** — OpenTelemetry, métricas, dashboards no Grafana/Prometheus.
11. **Segurança** — JWT, RBAC, Rate Limiter, CORS, Helmet, *secrets management*.
12. **Delivery** — Docker images, GitHub Actions, *preview env*, K8s manifests.

> Cada artigo termina com: **backlog** objetivo + **critério de pronto** para a próxima parte.

---

## Backlog de tópicos transversais (para interlúdios rápidos)

* Padrão **Outbox** + *Exactly‑Once* com Kafka (prático).
* **Contratos** HTTP e de eventos: Pact/AsyncAPI.
* Testes de SAGA (orquestrador): cenários felizes, *timeouts*, falhas e compensações.
* **Idempotência** com Redis e *deduplication keys*.
* **Feature flags** e *dark launches* para endpoints críticos.
* **DTO vs Domain** + *Mappers* e *Validations*.
* Mock de Kafka nos testes; *testcontainers* local.

---

## Guia de estilo editorial (compatível com a POC logística)

* **Tom**: técnico, direto, com trechos de decisão (“Por que X e não Y?”).
* **TDD**: sempre mostrar o *vermelho* primeiro (teste falhando), *verde* e *refactor*.
* **Diagramas**: usar Mermaid (arquitetura, sequência da SAGA, tópicos Kafka).
* **Links úteis**: PRs e commits específicos em cada seção.
* **Métricas**: cobertura de testes, latência média, consumo CPU/RAM em dev.

---

# Artigo 1 — Kickoff, Monorepo e Plano de SAGA (versão final)

**Título (SEO):** ECommerce SaaS #1 — Kickoff, monorepo com pnpm e plano da SAGA orquestrada
**Subtítulo:** Estruturando contextos de domínio, serviços e cadência de entrega com TDD/DDD

> *TL;DR*: montamos o monorepo com pnpm workspaces, definimos os Bounded Contexts e os serviços iniciais (catalog, inventory, order/orchestrator), esboçamos a SAGA (pedido → estoque → pagamento → notificação) e deixamos scripts, qualidade e observabilidade encaminhados para os próximos artigos.

---

## Contexto & Problema

Reescrever um e‑commerce como **SaaS multi‑serviços** é mais do que “fatiar endpoints”. Precisamos **delimitar domínios** (catálogo, estoque, pedido, pagamento, notificação), **padronizar** a DX (scripts, lint, testes, docs) e **planejar a SAGA** para coordenar processos longos com compensações seguras. O objetivo deste primeiro artigo é **tirar o atrito inicial**: estrutura do repositório, convenções, diagramas e plano editorial para a série.

## Objetivos (SMART)

* [x] Criar **monorepo** com pnpm workspaces e *scripts* padrão.
* [x] Mapear **Bounded Contexts** e serviços iniciais: `svc-catalog`, `svc-inventory`, `svc-order` (orquestrador).
* [x] Esboçar **SAGA orquestrada** (eventos e compensações).
* [x] Preparar **qualidade base** (ESLint/Prettier, Husky, cobertura mínima) e **documentação** (Swagger).
* [x] Definir **pipeline editorial** (template repetível + links/PRs por seção).

## Arquitetura & Decisões

```mermaid
graph LR
  Client --> API_Gateway
  API_Gateway --> svc_catalog
  API_Gateway --> svc_order
  svc_order -->|events| Kafka
  Kafka --> svc_inventory
  Kafka --> svc_payment
  svc_payment --> svc_order
  svc_inventory --> svc_order
  svc_order --> svc_notification
```

* **SAGA orquestrada**: `svc-order` coordena o estado; `inventory` e `payment` reagem a eventos e devolvem status.
* **Comunicação**: HTTP para comandos síncronos (criação de pedido), **Kafka** para etapas longas e reprocessáveis.
* **Dados**: Postgres por serviço (isolamento lógico). Eventual *event store* (Mongo) apenas quando necessário.
* **Contratos**: Swagger/OpenAPI para HTTP; eventos **JSON** versionados com `correlationId` e `causationId`.

## Passo a passo (TDD)

**Red**

1. Defina um *smoke test* simples por serviço (ex.: `GET /health` retorna `200`).
2. Adicione `lint` e `test` no *root* e falhe o pipeline sem cobertura mínima.

**Green**

1. Crie o monorepo e os *scaffolds* NestJS:

```bash
mkdir saas-ecommerce && cd saas-ecommerce
pnpm init -y
# package.json (raiz)
# { "private": true, "workspaces": ["apps/*", "libs/*"], "scripts": { "dev": "pnpm -r --parallel start:dev", "build": "pnpm -r build", "test": "pnpm -r test -- --coverage", "lint": "pnpm -r lint" } }

pnpm dlx @nestjs/cli new apps/svc-catalog --package-manager=pnpm --strict
pnpm dlx @nestjs/cli new apps/svc-inventory --package-manager=pnpm --strict
pnpm dlx @nestjs/cli new apps/svc-order --package-manager=pnpm --strict
```

2. Padronize ESLint/Prettier (raiz e apps) e habilite **Husky + lint-staged** para *pre-commit*.

**Refactor**

* Extraia utilidades comuns para `libs/*` (ex.: `libs/observability`, `libs/auth-core` nos próximos artigos).
* Centralize *scripts* no `package.json` raiz para DX consistente.
* Nomeie *branches* e *PRs* com *conventional commits* para facilitar changelog.

## Testes & Qualidade

* **Cobertura alvo** inicial: ≥ **70%** nos apps *scaffold* (aumenta para 80% a partir do Artigo 2).
* *Checks* de CI: `lint`, `test --coverage`, *type‑check*.
* Healthcheck padronizado: `GET /health` em todos os serviços.

## Observabilidade & Operação (prévia)

* Reserve `libs/observability` para o **Artigo 8** (OTel, Prometheus).
* Estruture variáveis em `.env` no **raiz** e por serviço.
* Planeje `docker-compose.yml` (Postgres, Redis, Kafka, Kafdrop) para o **Artigo 3**.

## Resultados

* Monorepo com **pnpm workspaces** funcionando e serviços iniciais criados.
* Diagrama e **SAGA** esboçados com eventos principais.
* Base de qualidade (lint, testes, *pre-commit*) padronizada entre apps.

## Próximos passos

* **Artigo 2 — Catálogo**: Prisma schema, CRUD, Swagger e testes (e a correção do erro comum do `PrismaService`).
* **Artigo 3 — Infra local**: Compose com Postgres/Redis/Kafka/Kafdrop e *healthchecks*.

## English abstract

We kick off the SaaS e‑commerce rewrite with a pnpm monorepo, clear bounded contexts and an orchestrated SAGA plan (order → inventory → payment → notification). We set repository standards (lint/tests/scripts) and prepare the local infrastructure and observability that will be delivered in the next articles.

---

### Metadados de Publicação (Medium/LinkedIn)

* **Slug (Medium):** `ecommerce-saas-01-kickoff-monorepo-saga`
* **Tags:** `nodejs`, `microservices`, `saga`, `nestjs`, `tdd`
* **Capa:** diagrama Mermaid exportado (fluxo SAGA resumido).
* **CTA:** “⚙️ Código e PRs no repositório · 💬 Dúvidas? Comente no post.”
* **Cole o link do PR/commit:** `...`

# Artigo 2 — Catálogo com Prisma, Swagger e testes

**Título (SEO):** ECommerce SaaS #2 — Catálogo com Prisma, Swagger e TDD (resolvendo um erro comum do PrismaService)

**Objetivos**

* [ ] Modelar `Product`/`Category` no Prisma e aplicar migrações.
* [ ] Implementar `ProductRepository` + *use cases* + controller.
* [ ] Cobertura ≥ 80% no módulo.
* [ ] Documentar endpoints no Swagger.

**Passo a passo (núcleo)**

1. **Prisma schema (svc-catalog)**

```prisma
// apps/svc-catalog/prisma/schema.prisma
datasource db { provider = "postgresql" url = env("DATABASE_URL") }

generator client { provider = "prisma-client-js" }

model Product {
  id        String   @id @default(cuid())
  name      String
  sku       String   @unique
  price     Decimal
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

2. **Gerar cliente & migrar**

```
pnpm -F svc-catalog prisma generate
pnpm -F svc-catalog prisma migrate dev --name init_catalog
```

3. **PrismaService**

```ts
// apps/svc-catalog/src/infra/prisma/prisma.service.ts
import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() { await this.$connect(); }
  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => { await app.close(); });
  }
}
```

4. **Repository**

```ts
// apps/svc-catalog/src/modules/catalog/product.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}
  create(data: Prisma.ProductCreateInput) {
    return this.prisma.product.create({ data });
  }
}
```

> **Nota importante (erro recorrente):** O erro `Property 'product' does not exist on type 'PrismaService'` ocorre quando **(a)** o `PrismaService` **não** estende `PrismaClient`, **(b)** o `schema.prisma` não define `model Product`, ou **(c)** o cliente não foi gerado após mudança de schema. Solução: garantir o `extends PrismaClient`, checar `model Product` e executar `prisma generate` + `migrate dev` no *package* correto (`-F svc-catalog`).

5. **Swagger**

* Habilitar em `main.ts` com `DocumentBuilder` e `SwaggerModule`.
* Descrever `POST /products`, `GET /products` etc.

6. **Testes (TDD)**

* *Use cases*: criação/listagem/validações.
* *Controller e e2e* com *testcontainers* (opcional) ou mocks do Prisma.

**Resultados**

* CRUD de produtos estável; documentação Swagger disponível.
* Erro do PrismaService mitigado e registrado.

**Próximos passos**

* Artigo 3: **Infra** (Compose com Postgres/Kafka/Redis/Prisma Studio).
* Artigo 4: **Inventory** (reserva/baixa + eventos Kafka).

**English abstract**

We model Catalog using Prisma, ship Swagger docs and tests, and fix a common PrismaService pitfall by extending PrismaClient and regenerating the client after schema changes.

---

## Checklist editorial por artigo

* [ ] Diagrama atualizado (Mermaid).
* [ ] Snippets verificados (rodam localmente).
* [ ] Cobertura ≥ 80% (se aplicável).
* [ ] Screenshots (Swagger, Kafdrop, Grafana) quando fizer sentido.
* [ ] Links para PR/commits.
* [ ] **TL;DR** + **Próximos passos**.
* [ ] **English abstract**.

---

## Títulos & tags sugeridas (Medium/LinkedIn)

* **Títulos**:

  * “ECommerce SaaS #1 — Kickoff, Monorepo e plano de SAGA”
  * “ECommerce SaaS #2 — Catálogo com Prisma, Swagger e TDD”
  * “ECommerce SaaS #3 — Infra local com Docker e Kafdrop”
  * “ECommerce SaaS #4 — Inventory: reserva e eventos Kafka”
* **Tags**: `nodejs`, `typescript`, `nest`, `microservices`, `kafka`, `prisma`, `postgres`, `docker`, `tdd`, `ddd`, `saga`, `ecommerce`.

---

## Capa & Assets

* **Capa**: diagrama resumido (Mermaid exportado como imagem) + título.
* **Imagens**: Swagger UI, Kafdrop, grafos OTel, dashboards Grafana.
* **Gists/PRs**: vincular commits por tópico para facilitar leitura.

---

## Métricas editoriais (opcional)

* Visualizações, taxa de leitura, stars/forks no GitHub, comentários, *time‑to‑green* dos testes.

---

**Próxima ação sugerida**: iniciar o rascunho do **Artigo 3 (Infra local)** com `docker-compose.yml` contendo Postgres, Redis, Zookeeper/Kafka, Kafdrop e Prisma Studio; incluir *healthchecks* e redes dedicadas.

---

# Artigo 3 — Infra local com Docker e Kafdrop

**Título (SEO):** ECommerce SaaS #3 — Infra local com Docker: Postgres, Redis, Kafka/Zookeeper, Kafdrop e Prisma Studio
**Subtítulo:** Subindo a base de dados, mensageria e utilitários para acelerar o desenvolvimento

## Contexto & Problema

Para evoluir os microsserviços com TDD e SAGA, precisamos de uma **infra local reproduzível**. Este artigo entrega um `docker-compose.yml` com Postgres, Redis, Zookeeper/Kafka, Kafdrop e (opcional) Prisma Studio, todos com *healthchecks* e persistência.

## Objetivos (SMART)

* [ ] Subir Postgres, Redis, Kafka/Zookeeper e Kafdrop com `docker compose up -d`.
* [ ] Garantir persistência com volumes e *healthchecks* confiáveis.
* [ ] Expor URLs locais: Postgres `5432`, Redis `6379`, Kafdrop `9000`.
* [ ] Preparar `.env` e `DATABASE_URL` para o `svc-catalog` (Prisma).

## Arquitetura & Decisões

```mermaid
graph LR
  Dev --> Docker
  Docker --> Postgres[(Postgres)]
  Docker --> Redis[(Redis)]
  Docker --> ZK[Zookeeper]
  ZK --> Kafka[(Kafka)]
  Kafka --> Kafdrop[Web UI]
  svc_catalog --> Postgres
  svc_order --> Kafka
  svc_inventory --> Kafka
```

* **Kafka + Zookeeper** para simplicidade local (KRaft fica para futuro).
* **Kafdrop** para inspecionar tópicos/eventos.
* **Volumes** para persistir dados entre *ups* e *downs*.

## Arquivos

### 1) `.env.example` (raiz)

Crie na raiz do monorepo e depois copie para `.env`.

```ini
# Banco
POSTGRES_DB=saas_catalog
POSTGRES_USER=app
POSTGRES_PASSWORD=app
POSTGRES_PORT=5432

# Redis
REDIS_PASSWORD=appredis
REDIS_PORT=6379

# Kafka
KAFKA_BROKER_PORT=9092
ZOOKEEPER_PORT=2181

# URLs internas para serviços
DATABASE_URL=postgresql://app:app@postgres:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public
KAFKA_BROKERS=kafka:${KAFKA_BROKER_PORT}
REDIS_URL=redis://:appredis@redis:${REDIS_PORT}/0
```

> **Dica:** Nos serviços (ex.: `apps/svc-catalog/.env`), reutilize `DATABASE_URL` apontando para `postgres` (nome do container).

### 2) `docker-compose.yml` (raiz)

```yaml
version: '3.9'

name: saas-ecommerce-dev

services:
  postgres:
    image: postgres:16-alpine
    container_name: pg
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-saas_catalog}
      POSTGRES_USER: ${POSTGRES_USER:-app}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-app}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-app}"]
      interval: 5s
      timeout: 5s
      retries: 10
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks: [devnet]

  redis:
    image: redis:7-alpine
    command: ["redis-server", "--requirepass", "${REDIS_PASSWORD:-appredis}"]
    ports:
      - "${REDIS_PORT:-6379}:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD:-appredis}", "PING"]
      interval: 5s
      timeout: 5s
      retries: 10
    volumes:
      - redisdata:/data
    networks: [devnet]

  zookeeper:
    image: bitnami/zookeeper:3.9
    environment:
      - ALLOW_ANONYMOUS_LOGIN=yes
    ports:
      - "${ZOOKEEPER_PORT:-2181}:2181"
    healthcheck:
      test: ["CMD-SHELL", "echo ruok | nc -w 2 localhost 2181 | grep imok || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 10
    networks: [devnet]

  kafka:
    image: bitnami/kafka:3.7
    environment:
      - KAFKA_CFG_ZOOKEEPER_CONNECT=zookeeper:2181
      - KAFKA_CFG_LISTENERS=PLAINTEXT://:9092
      - KAFKA_CFG_ADVERTISED_LISTENERS=PLAINTEXT://kafka:9092
      - KAFKA_CFG_AUTO_CREATE_TOPICS_ENABLE=true
      - ALLOW_PLAINTEXT_LISTENER=yes
    depends_on:
      zookeeper:
        condition: service_healthy
    ports:
      - "${KAFKA_BROKER_PORT:-9092}:9092"
    healthcheck:
      test: ["CMD-SHELL", "nc -z localhost 9092 || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 10
    networks: [devnet]

  kafdrop:
    image: obsidiandynamics/kafdrop:3.31.0
    environment:
      - KAFKA_BROKERCONNECT=kafka:9092
      - JVM_OPTS=-Xms32M -Xmx64M
    depends_on:
      kafka:
        condition: service_healthy
    ports:
      - "9000:9000"
    command: ["--server.port=9000", "--message.format=AVRO"]
    networks: [devnet]

  # (Opcional) Prisma Studio — monta o repositório e expõe a UI
  prisma-studio:
    image: node:20-alpine
    working_dir: /workspace/apps/svc-catalog
    command: ["sh", "-c", "corepack enable && pnpm -v || corepack prepare pnpm@latest --activate; pnpm install -w --silent && pnpm -F svc-catalog prisma generate && pnpm -F svc-catalog prisma studio --port 5555 --hostname 0.0.0.0"]
    volumes:
      - ./:/workspace
    ports:
      - "5555:5555"
    depends_on:
      postgres:
        condition: service_healthy
    networks: [devnet]

volumes:
  pgdata:
  redisdata:

networks:
  devnet:
    driver: bridge
```

> **Notas**
>
> * `AUTO_CREATE_TOPICS_ENABLE=true` agiliza o dev; em produção, **desative** e gerencie tópicos por IaC.
> * O serviço `prisma-studio` é opcional; você pode rodar `pnpm -F svc-catalog prisma studio` no host se preferir.

### 3) `apps/svc-catalog/.env`

```ini
# Reutiliza a URL interna para o container Postgres
DATABASE_URL=postgresql://app:app@postgres:5432/saas_catalog?schema=public
```

### 4) `Makefile` (qualidade de vida, opcional)

```makefile
.PHONY: up down logs reset ps
up:
	docker compose up -d
	docker compose ps

e2e-up:
	docker compose up -d postgres redis zookeeper kafka kafdrop

ps:
	docker compose ps

logs:
	docker compose logs -f --tail=100

down:
	docker compose down

reset:
	docker compose down -v
```

## Passo a passo (TDD/Smoke)

1. **Subir a infra**

```bash
docker compose --env-file .env up -d
```

2. **Verificar saúde**

```bash
docker compose ps
curl -s http://localhost:9000 | head -n 5   # Kafdrop UI
nc -z localhost 5432 && echo "Postgres ok"
nc -z localhost 6379 && echo "Redis ok"
```

3. **Testar Prisma (svc-catalog)**

```bash
pnpm -F svc-catalog prisma generate
pnpm -F svc-catalog prisma migrate dev --name init_catalog
pnpm -F svc-catalog test -- --coverage
```

4. **Criar tópicos (opcional)**

> Com `AUTO_CREATE_TOPICS_ENABLE=true`, o Kafka cria ao publicar. Se quiser, crie manualmente via `kafka-topics.sh` dentro do container `kafka`.

**Sugestão de nomes:**

* `order.created`, `stock.reserved`, `stock.rejected`, `payment.approved`, `payment.rejected`, `order.completed`, `order.canceled`.

## Resultados

* Infra local **estável**, acessível e com dados persistidos.
* Kafdrop disponível em **[http://localhost:9000](http://localhost:9000)** para monitorar a SAGA.
* `svc-catalog` pronto para migrar schema e validar conexões.

## Problemas comuns & soluções

* **`ECONNREFUSED postgres`**: espere o *healthcheck* ficar `healthy` ou rode `depends_on` nos serviços app.
* **`prisma: error DATABASE_URL`**: confirme `.env` no pacote correto e `postgres` como host.
* **`Kafka: Connection to node -1 could not be established`**: verifique portas, `KAFKA_CFG_ADVERTISED_LISTENERS` e a rede `devnet`.

## Próximos passos

* Artigo 4: **Inventory** — API de reserva/baixa, tópicos Kafka e testes de integração.
* Adicionar **Nginx (API Gateway)** e *rate limiting* em *dev* para simular o tráfego real.

## English abstract

We provision a reproducible local stack with Docker (Postgres, Redis, Kafka/Zookeeper, Kafdrop and optional Prisma Studio), healthchecks, and persistent volumes. Catalog now connects to Postgres; events can be inspected via Kafdrop at port 9000. Next: Inventory service and Kafka-driven flows.

---

# Artigo 4 — Inventory (reserva/baixa) + eventos Kafka + testes de integração

**Título (SEO):** ECommerce SaaS #4 — Inventory: reserva/baixa de estoque com NestJS, Prisma e Kafka (SAGA orquestrada)
**Subtítulo:** Consumindo `order.created`, garantindo consistência e emitindo `stock.reserved`/`stock.rejected`

## Contexto & Problema

Após publicar o Catálogo e a Infra local, precisamos implementar o **serviço de Inventário** responsável por **reservar** (e eventualmente **liberar**) estoque quando um pedido é iniciado. Essa etapa é crítica para a SAGA: o orquestrador envia `order.created` → o Inventory tenta reservar → emite `stock.reserved` *ou* `stock.rejected` → o orquestrador decide o próximo passo.

## Objetivos (SMART)

* [ ] Implementar o `svc-inventory` com **NestJS + Prisma** e **Kafka** (consumer/producer).
* [ ] Garantir **consistência** na reserva com transação e *check* atômico (Postgres).
* [ ] Emitir eventos `stock.reserved`/`stock.rejected` e `stock.released` para compensações.
* [ ] Cobertura de testes (unit + integração) ≥ **80%** do módulo Inventory.
* [ ] Documentar endpoints administrativos (Swagger) e contratos de evento.

## Arquitetura & Decisões

```mermaid
sequenceDiagram
  participant OrderSvc as svc-order (orquestrador)
  participant Kafka as Kafka
  participant Inv as svc-inventory

  OrderSvc->>Kafka: order.created {orderId, items, correlationId}
  Kafka->>Inv: order.created
  alt estoque suficiente
    Inv->>Kafka: stock.reserved {orderId, items, correlationId}
  else insuficiente
    Inv->>Kafka: stock.rejected {orderId, reason, missing, correlationId}
  end
  Note over OrderSvc: Avança para pagamento ou cancela SAGA
```

**Decisões-chave**

* **Reserva atômica** via **SQL condicional** dentro de transação. Evita *race conditions*.
* **Idempotência** por `idempotencyKey` (por pedido + item).
* **Eventos simples** (JSON) com `correlationId`/`causationId` para rastreio.
* **HTTP** apenas para **admin** (consultar/ajustar estoque). Fluxo principal é **assíncrono**.

## Arquivos & Configuração

### 1) Estrutura inicial

```
apps/
  svc-inventory/
    prisma/
      schema.prisma
    src/
      infra/prisma/prisma.service.ts
      modules/inventory/
        dto/
          adjust-stock.dto.ts
          reserve.dto.ts
        inventory.repository.ts
        inventory.service.ts
        inventory.controller.ts
        inventory.events.ts
        inventory.consumer.ts
      main.ts
    .env
```

### 2) `.env` (apps/svc-inventory/.env)

```ini
DATABASE_URL=postgresql://app:app@postgres:5432/saas_catalog?schema=public
KAFKA_CLIENT_ID=svc-inventory
KAFKA_BROKERS=kafka:9092
KAFKA_GROUP_ID=inventory-consumer
HTTP_PORT=3002
```

> Em **dev**, estamos usando o mesmo banco do catálogo por simplicidade. Em produção, cada serviço deve ter **sua própria base**.

### 3) Prisma schema (apps/svc-inventory/prisma/schema.prisma)

```prisma
datasource db { provider = "postgresql" url = env("DATABASE_URL") }

generator client { provider = "prisma-client-js" }

model InventoryItem {
  id         String   @id @default(cuid())
  productId  String   @unique
  available  Int      @default(0)
  reserved   Int      @default(0)
  version    Int      @default(0) // para OCC
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model ReservationLog {
  id             String   @id @default(cuid())
  orderId        String
  productId      String
  qty            Int
  idempotencyKey String   @unique
  status         String   // REQUESTED | RESERVED | REJECTED | RELEASED
  createdAt      DateTime @default(now())
}
```

**Gerar & migrar**

```bash
pnpm -F svc-inventory prisma generate
pnpm -F svc-inventory prisma migrate dev --name init_inventory
```

### 4) PrismaService (apps/svc-inventory/src/infra/prisma/prisma.service.ts)

```ts
import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() { await this.$connect(); }
  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => { await app.close(); });
  }
}
```

### 5) Contratos de evento (apps/svc-inventory/src/modules/inventory/inventory.events.ts)

```ts
export type OrderCreatedEvent = {
  event: 'order.created';
  orderId: string;
  items: Array<{ productId: string; qty: number }>;
  correlationId: string;
  idempotencyKey?: string; // opcional (global)
};

export type StockReservedEvent = {
  event: 'stock.reserved';
  orderId: string;
  items: Array<{ productId: string; qty: number }>;
  correlationId: string;
  causationId: string; // id do evento de entrada
};

export type StockRejectedEvent = {
  event: 'stock.rejected';
  orderId: string;
  reason: string;
  missing: Array<{ productId: string; needed: number; available: number }>;
  correlationId: string;
  causationId: string;
};

export type StockReleasedEvent = {
  event: 'stock.released';
  orderId: string;
  items: Array<{ productId: string; qty: number }>;
  correlationId: string;
  causationId: string;
};
```

### 6) Repositório com reserva atômica (apps/svc-inventory/src/modules/inventory/inventory.repository.ts)

```ts
import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class InventoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByProductId(productId: string) {
    return this.prisma.inventoryItem.findUnique({ where: { productId } });
  }

  async adjust(productId: string, delta: number) {
    // delta pode ser positivo (entrada) ou negativo (baixa administrativa)
    return this.prisma.inventoryItem.upsert({
      where: { productId },
      update: { available: { increment: delta } },
      create: { productId, available: Math.max(0, delta) },
    });
  }

  async reserveAtomic(productId: string, qty: number) {
    // Atualização condicional atômica: só reserva se houver saldo suficiente
    const updated = await this.prisma.$executeRaw<Prisma.Sql>(Prisma.sql`
      UPDATE "InventoryItem"
      SET available = available - ${qty},
          reserved  = reserved + ${qty},
          version   = version + 1,
          "updatedAt" = NOW()
      WHERE "productId" = ${productId} AND available >= ${qty};
    `);
    // $executeRaw retorna number (rowCount); 1 => sucesso
    return updated === 1;
  }

  async releaseAtomic(productId: string, qty: number) {
    const updated = await this.prisma.$executeRaw<Prisma.Sql>(Prisma.sql`
      UPDATE "InventoryItem"
      SET available = available + ${qty},
          reserved  = reserved - ${qty},
          version   = version + 1,
          "updatedAt" = NOW()
      WHERE "productId" = ${productId} AND reserved >= ${qty};
    `);
    return updated === 1;
  }
}
```

### 7) DTOs (apps/svc-inventory/src/modules/inventory/dto/*.ts)

```ts
// adjust-stock.dto.ts
import { IsInt, IsString, Min } from 'class-validator';
export class AdjustStockDto {
  @IsString() productId!: string;
  @IsInt() @Min(1) qty!: number; // use negativo para baixa
}

// reserve.dto.ts
import { ArrayMinSize, IsArray, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ReserveItemDto {
  @IsString() productId!: string;
  @IsInt() @Min(1) qty!: number;
}

export class ReserveDto {
  @IsString() orderId!: string;
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => ReserveItemDto)
  items!: ReserveItemDto[];
  @IsOptional() @IsString() correlationId?: string;
}
```

### 8) Service (apps/svc-inventory/src/modules/inventory/inventory.service.ts)

```ts
import { Injectable } from '@nestjs/common';
import { InventoryRepository } from './inventory.repository';
import { ReserveDto } from './dto/reserve.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly repo: InventoryRepository) {}

  async reserve(dto: ReserveDto) {
    const failures: Array<{ productId: string; needed: number; available: number }> = [];

    // Checagem rápida (não atômica) para diagnosticar faltas; a garantia final é o update condicional
    for (const it of dto.items) {
      const row = await this.repo.findByProductId(it.productId);
      const available = row?.available ?? 0;
      if (available < it.qty) {
        failures.push({ productId: it.productId, needed: it.qty, available });
      }
    }
    if (failures.length) {
      return { ok: false, failures } as const;
    }

    // Reserva atômica item a item; se algum falhar, desfaz as anteriores
    const reserved: Array<{ productId: string; qty: number }> = [];
    for (const it of dto.items) {
      const ok = await this.repo.reserveAtomic(it.productId, it.qty);
      if (!ok) {
        // rollback simples
        for (const r of reserved.reverse()) {
          await this.repo.releaseAtomic(r.productId, r.qty);
        }
        // recomputa available para mensagem
        const row = await this.repo.findByProductId(it.productId);
        const available = row?.available ?? 0;
        return { ok: false, failures: [{ productId: it.productId, needed: it.qty, available }] } as const;
      }
      reserved.push({ productId: it.productId, qty: it.qty });
    }

    return { ok: true, reserved } as const;
  }

  async release(orderId: string, items: Array<{ productId: string; qty: number }>) {
    for (const it of items) {
      await this.repo.releaseAtomic(it.productId, it.qty);
    }
    return { ok: true } as const;
  }
}
```

### 9) Consumer/Producer Kafka (apps/svc-inventory/src/modules/inventory/inventory.consumer.ts)

```ts
import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, KafkaContext, Payload } from '@nestjs/microservices';
import { InventoryService } from './inventory.service';
import { StockRejectedEvent, StockReservedEvent } from './inventory.events';

@Controller()
export class InventoryConsumer {
  private readonly logger = new Logger(InventoryConsumer.name);
  constructor(private readonly service: InventoryService) {}

  @EventPattern('order.created')
  async onOrderCreated(@Payload() message: any, @Ctx() context: KafkaContext) {
    const { orderId, items, correlationId } = message?.value ?? message;
    const result = await this.service.reserve({ orderId, items, correlationId });

    const producer = context.getProducer();
    const causationId = context.getMessage().headers?.['message-id'] || '';

    if (result.ok) {
      const evt: StockReservedEvent = { event: 'stock.reserved', orderId, items: result.reserved, correlationId, causationId };
      await producer.send({ topic: 'stock.reserved', messages: [{ value: JSON.stringify(evt) }] });
      this.logger.log(`Reserved for order ${orderId}`);
    } else {
      const evt: StockRejectedEvent = { event: 'stock.rejected', orderId, reason: 'INSUFFICIENT_STOCK', missing: result.failures, correlationId, causationId };
      await producer.send({ topic: 'stock.rejected', messages: [{ value: JSON.stringify(evt) }] });
      this.logger.warn(`Rejected for order ${orderId}`);
    }
  }
}
```

### 10) Controller HTTP (admin) (apps/svc-inventory/src/modules/inventory/inventory.controller.ts)

```ts
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryRepository } from './inventory.repository';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { ReserveDto } from './dto/reserve.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly repo: InventoryRepository, private readonly service: InventoryService) {}

  @Get(':productId')
  async get(@Param('productId') productId: string) {
    return this.repo.findByProductId(productId);
  }

  @Post('adjust')
  async adjust(@Body() dto: AdjustStockDto) {
    const delta = dto.qty; // negativo para baixa
    return this.repo.adjust(dto.productId, delta);
  }

  @Post('reserve') // útil em dev para testar sem Kafka
  async reserve(@Body() dto: ReserveDto) {
    return this.service.reserve(dto);
  }
}
```

### 11) Bootstrap Kafka + HTTP (apps/svc-inventory/src/main.ts)

```ts
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // HTTP admin
  const httpPort = Number(process.env.HTTP_PORT || 3002);
  await app.listen(httpPort);

  // Kafka consumer
  const kafka = await app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: { clientId: process.env.KAFKA_CLIENT_ID || 'svc-inventory', brokers: (process.env.KAFKA_BROKERS || 'kafka:9092').split(',') },
      consumer: { groupId: process.env.KAFKA_GROUP_ID || 'inventory-consumer' },
      subscribe: { fromBeginning: false },
    },
  });

  await app.startAllMicroservices();
  // eslint-disable-next-line no-console
  console.log(`Inventory HTTP running on :${httpPort}`);
}
bootstrap();
```

> **Swagger**: habilite em `main.ts` (HTTP app) com `DocumentBuilder`/`SwaggerModule` para expor `/inventory/*`.

## Testes (TDD)

### 1) Unit (mocks do Prisma)

```ts
// inventory.service.spec.ts (exemplo)
import { InventoryService } from './inventory.service';

describe('InventoryService', () => {
  it('reserva quando há saldo', async () => {
    const repo: any = {
      findByProductId: jest.fn().mockResolvedValue({ available: 10 }),
      reserveAtomic: jest.fn().mockResolvedValue(true),
      releaseAtomic: jest.fn().mockResolvedValue(true)
    };
    const svc = new InventoryService(repo);
    const res = await svc.reserve({ orderId: 'o1', items: [{ productId: 'p1', qty: 3 }] });
    expect(res.ok).toBe(true);
    expect(repo.reserveAtomic).toHaveBeenCalledWith('p1', 3);
  });

  it('rejeita quando faltar saldo', async () => {
    const repo: any = {
      findByProductId: jest.fn().mockResolvedValue({ available: 1 }),
      reserveAtomic: jest.fn(),
      releaseAtomic: jest.fn()
    };
    const svc = new InventoryService(repo);
    const res = await svc.reserve({ orderId: 'o1', items: [{ productId: 'p1', qty: 3 }] });
    expect(res.ok).toBe(false);
  });
});
```

### 2) Integração (Testcontainers) — opcional, recomendado

```ts
// integration.spec.ts (esboço)
import { GenericContainer } from 'testcontainers';
import { PrismaClient } from '@prisma/client';

it('reserva de forma atômica', async () => {
  const pg = await new GenericContainer('postgres:16-alpine')
    .withEnv('POSTGRES_PASSWORD', 'app')
    .withEnv('POSTGRES_USER', 'app')
    .withEnv('POSTGRES_DB', 'testdb')
    .withExposedPorts(5432)
    .start();

  const client = new PrismaClient({ datasources: { db: { url: `postgresql://app:app@${pg.getHost()}:${pg.getMappedPort(5432)}/testdb?schema=public` } } });
  await client.$executeRawUnsafe('CREATE TABLE "InventoryItem" (id text primary key, "productId" text unique, available int, reserved int, version int, "updatedAt" timestamptz, "createdAt" timestamptz)');
  await client.inventoryItem.create({ data: { id: 'i1', productId: 'p1', available: 5, reserved: 0, version: 0 } });

  const ok = await client.$executeRawUnsafe('UPDATE "InventoryItem" SET available = available - $1, reserved = reserved + $1 WHERE "productId" = $2 AND available >= $1', 3, 'p1');
  expect(ok).toBe(1);

  await client.$disconnect();
  await pg.stop();
});
```

> **Meta de cobertura**: `pnpm -F svc-inventory test -- --coverage` ≥ 80%.

## Resultados

* `svc-inventory` consome `order.created` e responde corretamente com `stock.reserved` ou `stock.rejected`.
* Endpoints administrativos /inventory habilitados (Swagger) para **consulta** e **ajuste** de estoque.
* Testes unitários e de integração asseguram a reserva atômica e o rollback em falhas.

## Próximos passos

* **Artigo 5 — Orquestrador (svc-order)**: Outbox, idempotência, coreografia com os tópicos de Inventory e *timeouts* de pagamento.
* **Melhorias**: armazenar logs de evento (event store), *rate limits* nos endpoints admin, *dead-letter topics*.

## English abstract

We implement `svc-inventory` in NestJS + Prisma with Kafka consumer/producer. The service atomically reserves stock on `order.created`, emits `stock.reserved` or `stock.rejected`, and exposes admin HTTP endpoints for querying/adjusting stock. Tests cover atomic reservation and rollback. Next: the orchestrator with outbox and idempotency.

---

# Artigo 5 — Orquestrador (svc-order) com Outbox, Idempotência e Timeouts de Pagamento

**Título (SEO):** ECommerce SaaS #5 — Orquestrador da SAGA: Outbox + Idempotência + Timeouts de pagamento no NestJS
**Subtítulo:** Iniciando a SAGA com `order.created`, reagindo a `stock.*`, solicitando `payment.requested` e concluindo com `order.completed`/`order.canceled`

## Contexto & Problema

O serviço **svc-order** é o **orquestrador** da SAGA. Ele inicia o fluxo (`order.created`), aguarda `stock.reserved` ou `stock.rejected`, solicita pagamento (`payment.requested`) e finaliza com `order.completed` ou `order.canceled`. Para confiabilidade, aplicamos **Outbox Pattern**, **idempotência** e **timeouts**.

## Objetivos (SMART)

* [ ] Implementar o **svc-order** com criação de pedido **idempotente** e emissão de `order.created` via **Outbox**.
* [ ] Consumir `stock.reserved`/`stock.rejected` e publicar `payment.requested` ou `order.canceled`.
* [ ] Consumir `payment.approved`/`payment.rejected` e concluir `order.completed`/`order.canceled`.
* [ ] Implementar **timeout scanner** para cancelar pedidos em `PAYMENT_PENDING` após N minutos.
* [ ] Cobertura ≥ **80%** (unit + integração).

## Arquitetura & Decisões

```mermaid
flowchart LR
  Client -->|POST /orders| OrderSvc
  subgraph OrderSvc
    Controller --> Service --> Repo
    Repo -->|tx| DB[(Postgres)]
    OutboxRelay -->|publish| Kafka
    ConsumerKafka --> Service
  end
  Kafka <--> Inventory
  Kafka <--> Payment
```

* **Outbox**: grava evento e dados do pedido na **mesma transação**; um **relay** assíncrono publica no Kafka com **retry/backoff**.
* **Idempotência**: chave por requisição (`Idempotency-Key`) e/ou por `orderId` atribuído no servidor.
* **Deduplicação** (consumer): tabela `ProcessedEvent` (ou Redis) por `eventId`/`message-id` do Kafka.
* **Timeout**: *scheduler* que cancela pedidos sem resposta de pagamento em X minutos.

## Arquivos & Estrutura

```
apps/
  svc-order/
    prisma/
      schema.prisma
    src/
      infra/prisma/prisma.service.ts
      modules/order/
        dto/
          create-order.dto.ts
        order.repository.ts
        order.service.ts
        order.controller.ts
        events.ts
        outbox.relay.ts
        consumers.kafka.ts
      main.ts
    .env
```

### 1) `.env` (apps/svc-order/.env)

```ini
DATABASE_URL=postgresql://app:app@postgres:5432/saas_catalog?schema=public
KAFKA_CLIENT_ID=svc-order
KAFKA_BROKERS=kafka:9092
KAFKA_GROUP_ID=order-consumer
HTTP_PORT=3001
PAYMENT_TIMEOUT_MINUTES=5
```

### 2) Prisma schema (apps/svc-order/prisma/schema.prisma)

```prisma
datasource db { provider = "postgresql" url = env("DATABASE_URL") }

generator client { provider = "prisma-client-js" }

enum OrderStatus {
  CREATED
  STOCK_PENDING
  STOCK_REJECTED
  PAYMENT_PENDING
  COMPLETED
  CANCELED
}

model Order {
  id         String       @id @default(cuid())
  customerId String
  status     OrderStatus  @default(CREATED)
  total      Decimal      @default(0)
  idempotencyKey String?  @unique
  correlationId  String   @default("")
  createdAt  DateTime     @default(now())
  updatedAt  DateTime     @updatedAt
  reservedAt DateTime?
  items      OrderItem[]
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  productId String
  qty       Int
  price     Decimal @default(0)
  Order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  @@index([orderId])
}

model Outbox {
  id            String   @id @default(cuid())
  aggregateType String
  aggregateId   String
  eventType     String
  payload       Json
  status        String   @default("PENDING") // PENDING | SENT | ERROR
  attempts      Int      @default(0)
  lastError     String?
  correlationId String   @default("")
  causationId   String   @default("")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  @@index([status, createdAt])
}

model ProcessedEvent {
  id        String   @id @default(cuid())
  eventId   String   @unique // message-id do Kafka
  createdAt DateTime  @default(now())
}
```

### 3) Contratos de evento (apps/svc-order/src/modules/order/events.ts)

```ts
export type OrderCreated = {
  event: 'order.created';
  orderId: string;
  items: Array<{ productId: string; qty: number; price: number }>;
  customerId: string;
  total: number;
  correlationId: string;
};

export type PaymentRequested = {
  event: 'payment.requested';
  orderId: string;
  amount: number;
  correlationId: string;
  causationId: string;
};

export type OrderCompleted = { event: 'order.completed'; orderId: string; correlationId: string; causationId: string };
export type OrderCanceled  = { event: 'order.canceled';  orderId: string; reason: string; correlationId: string; causationId: string };
```

### 4) DTO de criação (apps/svc-order/src/modules/order/dto/create-order.dto.ts)

```ts
import { ArrayMinSize, IsArray, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ItemDto {
  @IsString() productId!: string;
  // preço opcional em dev; em produção viria do catálogo/precificação
  @IsOptional() price?: number;
  qty!: number;
}

export class CreateOrderDto {
  @IsString() customerId!: string;
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => ItemDto)
  items!: ItemDto[];
  @IsOptional() @IsString() idempotencyKey?: string;
}
```

### 5) Repository (apps/svc-order/src/modules/order/order.repository.ts)

```ts
import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class OrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string) {
    return this.prisma.order.findUnique({ where: { id }, include: { items: true } });
  }

  async findByIdempotencyKey(key: string) {
    return this.prisma.order.findUnique({ where: { idempotencyKey: key }, include: { items: true } });
  }

  async createWithOutbox(dto: { customerId: string; items: Array<{ productId: string; qty: number; price?: number }>; idempotencyKey?: string; correlationId: string; }) {
    const total = dto.items.reduce((acc, it) => acc + (it.price ?? 0) * it.qty, 0);
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          customerId: dto.customerId,
          status: 'STOCK_PENDING',
          total,
          idempotencyKey: dto.idempotencyKey,
          correlationId: dto.correlationId,
          items: {
            create: dto.items.map((it) => ({ productId: it.productId, qty: it.qty, price: new Prisma.Decimal(it.price ?? 0) })),
          },
        },
        include: { items: true },
      });

      const eventPayload = {
        event: 'order.created',
        orderId: order.id,
        items: order.items.map((i) => ({ productId: i.productId, qty: i.qty, price: Number(i.price) })),
        customerId: order.customerId,
        total: Number(order.total),
        correlationId: dto.correlationId,
      };

      await tx.outbox.create({
        data: {
          aggregateType: 'Order',
          aggregateId: order.id,
          eventType: 'order.created',
          payload: eventPayload as unknown as Prisma.InputJsonValue,
          correlationId: dto.correlationId,
        },
      });

      return order;
    });
  }

  async markReserved(orderId: string) {
    return this.prisma.order.update({ where: { id: orderId }, data: { status: 'PAYMENT_PENDING', reservedAt: new Date() } });
  }

  async cancel(orderId: string) {
    return this.prisma.order.update({ where: { id: orderId }, data: { status: 'CANCELED' } });
  }

  async complete(orderId: string) {
    return this.prisma.order.update({ where: { id: orderId }, data: { status: 'COMPLETED' } });
  }
}
```

### 6) Service (apps/svc-order/src/modules/order/order.service.ts)

```ts
import { Injectable } from '@nestjs/common';
import { OrderRepository } from './order.repository';

@Injectable()
export class OrderService {
  constructor(private readonly repo: OrderRepository) {}

  async create(dto: { customerId: string; items: Array<{ productId: string; qty: number; price?: number }>; idempotencyKey?: string; correlationId: string }) {
    if (dto.idempotencyKey) {
      const found = await this.repo.findByIdempotencyKey(dto.idempotencyKey);
      if (found) return found; // idempotente
    }
    return this.repo.createWithOutbox(dto);
  }
}
```

### 7) Controller (apps/svc-order/src/modules/order/order.controller.ts)

```ts
import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly service: OrderService, private readonly repo: OrderRepository) {}

  @Post()
  async create(@Body() body: CreateOrderDto, @Headers('Idempotency-Key') idemKey?: string) {
    const correlationId = crypto.randomUUID();
    const order = await this.service.create({ ...body, idempotencyKey: body.idempotencyKey || idemKey, correlationId });
    return { orderId: order.id, status: order.status, correlationId };
  }

  @Get(':id')
  get(@Param('id') id: string) { return this.repo.findById(id); }
}
```

### 8) Outbox Relay (apps/svc-order/src/modules/order/outbox.relay.ts)

```ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaClient } from '@prisma/client';
import { Kafka, logLevel } from 'kafkajs';

@Injectable()
export class OutboxRelay {
  private readonly logger = new Logger(OutboxRelay.name);
  private readonly kafka = new Kafka({ clientId: process.env.KAFKA_CLIENT_ID || 'svc-order-relay', brokers: (process.env.KAFKA_BROKERS || 'kafka:9092').split(','), logLevel: logLevel.NOTHING });
  private readonly producer = this.kafka.producer();

  constructor(private readonly prisma: PrismaClient) {}

  private async ensure() { await this.producer.connect(); }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async pump() {
    await this.ensure();
    const rows = await this.prisma.outbox.findMany({ where: { status: 'PENDING' }, take: 50, orderBy: { createdAt: 'asc' } });
    for (const row of rows) {
      try {
        await this.producer.send({ topic: row.eventType, messages: [{ value: JSON.stringify(row.payload), headers: { 'message-id': row.id, 'correlation-id': row.correlationId, 'aggregate-id': row.aggregateId } }] });
        await this.prisma.outbox.update({ where: { id: row.id }, data: { status: 'SENT', attempts: { increment: 1 } } });
      } catch (err: any) {
        await this.prisma.outbox.update({ where: { id: row.id }, data: { status: 'ERROR', attempts: { increment: 1 }, lastError: String(err?.message || err) } });
        this.logger.error(`Outbox ${row.id} => ${row.eventType} erro: ${err?.message}`);
      }
    }
  }
}
```

### 9) Consumers (apps/svc-order/src/modules/order/consumers.kafka.ts)

```ts
import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, KafkaContext, Payload } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';

@Controller()
export class OrderConsumers {
  private readonly logger = new Logger(OrderConsumers.name);
  constructor(private readonly prisma: PrismaClient) {}

  private async dedupe(context: KafkaContext) {
    const eventId = context.getMessage().headers?.['message-id'];
    if (!eventId) return true;
    try {
      await this.prisma.processedEvent.create({ data: { eventId: String(eventId) } });
      return true;
    } catch { return false; } // já processado
  }

  @EventPattern('stock.reserved')
  async onStockReserved(@Payload() msg: any, @Ctx() ctx: KafkaContext) {
    if (!(await this.dedupe(ctx))) return;
    const { orderId, items, correlationId } = msg.value ?? msg;
    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: orderId }, data: { status: 'PAYMENT_PENDING', reservedAt: new Date() } });
      await tx.outbox.create({ data: { aggregateType: 'Order', aggregateId: orderId, eventType: 'payment.requested', correlationId, payload: { event: 'payment.requested', orderId, amount: 0, correlationId, causationId: ctx.getMessage().headers?.['message-id'] || '' } } });
    });
  }

  @EventPattern('stock.rejected')
  async onStockRejected(@Payload() msg: any, @Ctx() ctx: KafkaContext) {
    if (!(await this.dedupe(ctx))) return;
    const { orderId, reason, correlationId } = msg.value ?? msg;
    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: orderId }, data: { status: 'CANCELED' } });
      await tx.outbox.create({ data: { aggregateType: 'Order', aggregateId: orderId, eventType: 'order.canceled', correlationId, payload: { event: 'order.canceled', orderId, reason: 'STOCK_REJECTED', correlationId, causationId: ctx.getMessage().headers?.['message-id'] || '' } } });
    });
  }

  @EventPattern('payment.approved')
  async onPaymentApproved(@Payload() msg: any, @Ctx() ctx: KafkaContext) {
    if (!(await this.dedupe(ctx))) return;
    const { orderId, correlationId } = msg.value ?? msg;
    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: orderId }, data: { status: 'COMPLETED' } });
      await tx.outbox.create({ data: { aggregateType: 'Order', aggregateId: orderId, eventType: 'order.completed', correlationId, payload: { event: 'order.completed', orderId, correlationId, causationId: ctx.getMessage().headers?.['message-id'] || '' } } });
    });
  }

  @EventPattern('payment.rejected')
  async onPaymentRejected(@Payload() msg: any, @Ctx() ctx: KafkaContext) {
    if (!(await this.dedupe(ctx))) return;
    const { orderId, correlationId } = msg.value ?? msg;
    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: orderId }, data: { status: 'CANCELED' } });
      await tx.outbox.create({ data: { aggregateType: 'Order', aggregateId: orderId, eventType: 'order.canceled', correlationId, payload: { event: 'order.canceled', orderId, reason: 'PAYMENT_REJECTED', correlationId, causationId: ctx.getMessage().headers?.['message-id'] || '' } } });
    });
  }
}
```

### 10) Timeouts de pagamento (scanner)

```ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PaymentTimeoutScanner {
  constructor(private readonly prisma: PrismaClient) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async scan() {
    const minutes = Number(process.env.PAYMENT_TIMEOUT_MINUTES || 5);
    const cutoff = new Date(Date.now() - minutes * 60_000);
    const pending = await this.prisma.order.findMany({ where: { status: 'PAYMENT_PENDING', reservedAt: { lt: cutoff } }, select: { id: true, correlationId: true } });
    for (const o of pending) {
      await this.prisma.$transaction(async (tx) => {
        await tx.order.update({ where: { id: o.id }, data: { status: 'CANCELED' } });
        await tx.outbox.create({ data: { aggregateType: 'Order', aggregateId: o.id, eventType: 'order.canceled', correlationId: o.correlationId, payload: { event: 'order.canceled', orderId: o.id, reason: 'PAYMENT_TIMEOUT', correlationId: o.correlationId, causationId: 'timeout-scanner' } } });
      });
    }
  }
}
```

### 11) Bootstrap (apps/svc-order/src/main.ts)

```ts
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(Number(process.env.HTTP_PORT || 3001));

  await app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: { client: { clientId: process.env.KAFKA_CLIENT_ID || 'svc-order', brokers: (process.env.KAFKA_BROKERS || 'kafka:9092').split(',') }, consumer: { groupId: process.env.KAFKA_GROUP_ID || 'order-consumer' } },
  });
  await app.startAllMicroservices();
}
bootstrap();
```

> **Swagger**: exponha `POST /orders` e `GET /orders/:id`. Documente o cabeçalho **Idempotency-Key**.
> **Observabilidade**: registre `correlationId` e `message-id` em logs/trace.

## Testes (TDD)

* **Unit**:

  * `order.service` — criação idempotente retorna o mesmo pedido quando `idempotencyKey` repete.
  * `outbox.relay` — transforma `PENDING` → `SENT` e trata erros (mantém `ERROR` com `lastError`).
* **Integração**:

  * **Postgres**: transação cria Order + Outbox; relay publica no Kafka (mock ou testcontainers).
  * **Kafka**: `stock.reserved` → `payment.requested`; `payment.approved` → `order.completed`; `payment.rejected`/`timeout` → `order.canceled`.

**Comandos**

```bash
pnpm -F svc-order prisma generate
pnpm -F svc-order prisma migrate dev --name init_order
pnpm -F svc-order test -- --coverage
```

## Resultados

* Orquestrador inicia SAGA com **Outbox** e mantém **idempotência** no `POST /orders`.
* Fluxos de `stock.*` e `payment.*` suportados com **deduplicação** e **timeouts**.
* Sistema pronto para integração do `svc-payment` e do `svc-notification` (próximos artigos).

## Próximos passos

* **Artigo 6 — Payment (stub + ACL)**: simulação de gateway, `payment.approved/rejected`, *timeouts* configuráveis.
* **Artigo 7 — Notification**: fan-out de `order.completed`/`order.canceled` (e-mail/whatsapp mock).

## English abstract

We implement the `svc-order` orchestrator with the Outbox pattern, idempotent order creation, Kafka consumers for stock/payment events, and a scheduler to cancel timed‑out payments. Transactions ensure atomicity (Order + Outbox), while a relay publishes events reliably. Next: stubbed Payment service and Notification.

---

# Artigo 6 — Payment (stub + ACL), aprova/rejeita, timeouts e retries

**Título (SEO):** ECommerce SaaS #6 — Payment (stub + ACL): aprovação, rejeição, timeouts e retries com Outbox
**Subtítulo:** Consumindo `payment.requested` do orquestrador, aplicando regras determinísticas e publicando `payment.approved`/`payment.rejected`

## Contexto & Problema

Integrações com gateways de pagamento são **lentas, caras e instáveis** em ambiente de desenvolvimento. Para manter a cadência da SAGA, construímos um **Payment stub** com uma **ACL (Anti‑Corruption Layer)** que simula um provedor externo, aplica regras determinísticas e publica eventos `payment.approved`/`payment.rejected`. Mantemos confiabilidade com **Outbox**, **idempotência**, **deduplicação** e **retries**.

## Objetivos (SMART)

* [ ] Implementar `svc-payment` (NestJS + Prisma) consumindo `payment.requested` e produzindo `payment.approved`/`payment.rejected`.
* [ ] Aplicar ACL com regra determinística (configurável) e **idempotência** por `orderId`.
* [ ] Usar **Outbox** para publicar eventos de forma resiliente e registrar **PaymentAttempt**.
* [ ] Expor endpoints **admin**: consulta de pagamentos, overrides manuais (simular webhooks do provedor).
* [ ] Cobertura de testes ≥ **80%** no módulo Payment.

## Arquitetura & Decisões

```mermaid
sequenceDiagram
  participant Order as svc-order
  participant Kafka as Kafka
  participant Pay as svc-payment

  Order->>Kafka: payment.requested {orderId, amount, correlationId}
  Kafka->>Pay: payment.requested
  alt regra aprova
    Pay->>Kafka: payment.approved {orderId, correlationId, causationId}
    Kafka->>Order: payment.approved
  else regra rejeita
    Pay->>Kafka: payment.rejected {orderId, reason, correlationId, causationId}
    Kafka->>Order: payment.rejected
  end
```

**Decisões‑chave**

* **Regra determinística** (stub): aprova se `amount <= PAYMENT_APPROVAL_LIMIT` (env) **ou** se `hash(orderId) % 3 != 0` (fallback).
* **Outbox** dentro do Payment para publicação confiável.
* **Idempotência**: uma decisão por `orderId` (se já aprovado/rejeitado, ignorar novas requisições).
* **Overrides admin** para simular *webhooks* do provedor (forçar *approved/rejected*).

## Arquivos & Estrutura

```
apps/
  svc-payment/
    prisma/
      schema.prisma
    src/
      infra/prisma/prisma.service.ts
      modules/payment/
        dto/
          override.dto.ts
        events.ts
        payment.repository.ts
        payment.service.ts
        payment.consumer.ts
        outbox.relay.ts
        payment.controller.ts
      main.ts
    .env
```

### 1) `.env` (apps/svc-payment/.env)

```ini
DATABASE_URL=postgresql://app:app@postgres:5432/saas_catalog?schema=public
KAFKA_CLIENT_ID=svc-payment
KAFKA_BROKERS=kafka:9092
KAFKA_GROUP_ID=payment-consumer
HTTP_PORT=3003
PAYMENT_APPROVAL_LIMIT=1000
```

> Em produção, **separe** o banco por serviço; aqui mantemos simples em dev.

### 2) Prisma schema (apps/svc-payment/prisma/schema.prisma)

```prisma
datasource db { provider = "postgresql" url = env("DATABASE_URL") }

generator client { provider = "prisma-client-js" }

enum PaymentStatus {
  REQUESTED
  APPROVED
  REJECTED
}

model Payment {
  id            String        @id @default(cuid())
  orderId       String        @unique
  amount        Decimal       @default(0)
  status        PaymentStatus @default(REQUESTED)
  reason        String?
  correlationId String        @default("")
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  attempts      PaymentAttempt[]
}

model PaymentAttempt {
  id        String   @id @default(cuid())
  paymentId String
  provider  String   @default("stub")
  status    String   // OK | FAIL
  code      String   @default("")
  raw       Json
  createdAt DateTime @default(now())
  Payment   Payment  @relation(fields: [paymentId], references: [id], onDelete: Cascade)
  @@index([paymentId])
}

model Outbox {
  id            String   @id @default(cuid())
  aggregateType String
  aggregateId   String
  eventType     String
  payload       Json
  status        String   @default("PENDING") // PENDING | SENT | ERROR
  attempts      Int      @default(0)
  lastError     String?
  correlationId String   @default("")
  causationId   String   @default("")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  @@index([status, createdAt])
}

model ProcessedEvent {
  id        String   @id @default(cuid())
  eventId   String   @unique
  createdAt DateTime @default(now())
}
```

### 3) Contratos de evento (apps/svc-payment/src/modules/payment/events.ts)

```ts
export type PaymentRequested = {
  event: 'payment.requested';
  orderId: string;
  amount: number;
  correlationId: string;
  causationId: string;
};

export type PaymentApproved = { event: 'payment.approved'; orderId: string; correlationId: string; causationId: string };
export type PaymentRejected = { event: 'payment.rejected'; orderId: string; reason: string; correlationId: string; causationId: string };
```

### 4) Repositório (apps/svc-payment/src/modules/payment/payment.repository.ts)

```ts
import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PaymentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findByOrderId(orderId: string) {
    return this.prisma.payment.findUnique({ where: { orderId } });
  }

  async createRequested(dto: { orderId: string; amount: number; correlationId: string }) {
    return this.prisma.payment.create({ data: { orderId: dto.orderId, amount: new Prisma.Decimal(dto.amount), correlationId: dto.correlationId } });
  }

  async appendAttempt(paymentId: string, attempt: { status: 'OK' | 'FAIL'; code: string; raw: any }) {
    return this.prisma.paymentAttempt.create({ data: { paymentId, status: attempt.status, code: attempt.code, raw: attempt.raw } });
  }

  async decideAndOutbox(paymentId: string, decision: { status: 'APPROVED' | 'REJECTED'; reason?: string; correlationId: string; causationId: string }) {
    const payment = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.payment.update({
        where: { id: paymentId },
        data: { status: decision.status as any, reason: decision.reason },
      });
      const eventType = decision.status === 'APPROVED' ? 'payment.approved' : 'payment.rejected';
      const payload = decision.status === 'APPROVED'
        ? { event: 'payment.approved', orderId: updated.orderId, correlationId: decision.correlationId, causationId: decision.causationId }
        : { event: 'payment.rejected', orderId: updated.orderId, reason: decision.reason || 'REJECTED', correlationId: decision.correlationId, causationId: decision.causationId };
      await tx.outbox.create({ data: { aggregateType: 'Payment', aggregateId: updated.id, eventType, payload: payload as unknown as Prisma.InputJsonValue, correlationId: decision.correlationId, causationId: decision.causationId } });
      return updated;
    });
    return payment;
  }
}
```

### 5) Service (apps/svc-payment/src/modules/payment/payment.service.ts)

```ts
import { Injectable } from '@nestjs/common';
import { PaymentRepository } from './payment.repository';

function hash(s: string) {
  let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h);
}

@Injectable()
export class PaymentService {
  constructor(private readonly repo: PaymentRepository) {}

  async handleRequested(input: { orderId: string; amount: number; correlationId: string; causationId: string }) {
    // idempotência por orderId
    let payment = await this.repo.findByOrderId(input.orderId);
    if (!payment) payment = await this.repo.createRequested({ orderId: input.orderId, amount: input.amount, correlationId: input.correlationId });
    if (payment.status !== 'REQUESTED') return payment; // já decidido

    // Regra determinística (stub)
    const limit = Number(process.env.PAYMENT_APPROVAL_LIMIT || 1000);
    const approved = input.amount <= limit || (hash(input.orderId) % 3 !== 0);

    // Anexa tentativa (simulando provedor externo)
    await this.repo.appendAttempt(payment.id, { status: approved ? 'OK' : 'FAIL', code: approved ? '00' : '51', raw: { engine: 'stub', limit, amount: input.amount } });

    if (approved) {
      await this.repo.decideAndOutbox(payment.id, { status: 'APPROVED', correlationId: input.correlationId, causationId: input.causationId });
    } else {
      await this.repo.decideAndOutbox(payment.id, { status: 'REJECTED', reason: 'LIMIT_EXCEEDED', correlationId: input.correlationId, causationId: input.causationId });
    }

    return this.repo.findByOrderId(input.orderId);
  }

  async override(orderId: string, decision: 'APPROVE' | 'REJECT', reason = 'ADMIN_OVERRIDE', correlationId = crypto.randomUUID()) {
    const payment = await this.repo.findByOrderId(orderId);
    if (!payment) throw new Error('Payment not found');
    const causationId = 'admin-override';
    await this.repo.appendAttempt(payment.id, { status: 'OK', code: decision === 'APPROVE' ? 'A0' : 'R0', raw: { source: 'admin', reason } });
    await this.repo.decideAndOutbox(payment.id, { status: decision === 'APPROVE' ? 'APPROVED' : 'REJECTED', reason, correlationId, causationId });
    return this.repo.findByOrderId(orderId);
  }
}
```

### 6) Consumer Kafka (apps/svc-payment/src/modules/payment/payment.consumer.ts)

```ts
import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, KafkaContext, Payload } from '@nestjs/microservices';
import { PaymentService } from './payment.service';

@Controller()
export class PaymentConsumer {
  constructor(private readonly service: PaymentService) {}

  @EventPattern('payment.requested')
  async onPaymentRequested(@Payload() message: any, @Ctx() context: KafkaContext) {
    const { orderId, amount, correlationId } = message?.value ?? message;
    const causationId = context.getMessage().headers?.['message-id'] || '';
    await this.service.handleRequested({ orderId, amount, correlationId, causationId });
  }
}
```

### 7) Outbox Relay (apps/svc-payment/src/modules/payment/outbox.relay.ts)

```ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaClient } from '@prisma/client';
import { Kafka, logLevel } from 'kafkajs';

@Injectable()
export class OutboxRelay {
  private readonly logger = new Logger(OutboxRelay.name);
  private readonly kafka = new Kafka({ clientId: process.env.KAFKA_CLIENT_ID || 'svc-payment-relay', brokers: (process.env.KAFKA_BROKERS || 'kafka:9092').split(','), logLevel: logLevel.NOTHING });
  private readonly producer = this.kafka.producer();
  constructor(private readonly prisma: PrismaClient) {}

  private async ensure() { await this.producer.connect(); }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async pump() {
    await this.ensure();
    const rows = await this.prisma.outbox.findMany({ where: { status: 'PENDING' }, take: 50, orderBy: { createdAt: 'asc' } });
    for (const row of rows) {
      try {
        await this.producer.send({ topic: row.eventType, messages: [{ value: JSON.stringify(row.payload), headers: { 'message-id': row.id, 'correlation-id': row.correlationId, 'aggregate-id': row.aggregateId } }] });
        await this.prisma.outbox.update({ where: { id: row.id }, data: { status: 'SENT', attempts: { increment: 1 } } });
      } catch (err: any) {
        await this.prisma.outbox.update({ where: { id: row.id }, data: { status: 'ERROR', attempts: { increment: 1 }, lastError: String(err?.message || err) } });
        this.logger.error(`Outbox ${row.id} erro: ${err?.message}`);
      }
    }
  }
}
```

### 8) Controller (admin) (apps/svc-payment/src/modules/payment/payment.controller.ts)

```ts
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly service: PaymentService) {}

  @Get(':orderId')
  get(@Param('orderId') orderId: string) { return this.service['repo'].findByOrderId(orderId); }

  @Post('override/approve')
  approve(@Body() body: { orderId: string; reason?: string }) { return this.service.override(body.orderId, 'APPROVE', body.reason); }

  @Post('override/reject')
  reject(@Body() body: { orderId: string; reason?: string }) { return this.service.override(body.orderId, 'REJECT', body.reason); }
}
```

### 9) Bootstrap (apps/svc-payment/src/main.ts)

```ts
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(Number(process.env.HTTP_PORT || 3003));

  await app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: { client: { clientId: process.env.KAFKA_CLIENT_ID || 'svc-payment', brokers: (process.env.KAFKA_BROKERS || 'kafka:9092').split(',') }, consumer: { groupId: process.env.KAFKA_GROUP_ID || 'payment-consumer' } },
  });
  await app.startAllMicroservices();
}
bootstrap();
```

> **Swagger**: documente `GET /payment/:orderId`, `POST /payment/override/*` (admin).
> **Observabilidade**: logue `correlationId/causationId` nas decisões do stub.

## Testes (TDD)

### Unit

* `payment.service` — aprova quando `amount <= limit`; rejeita acima; idempotência por `orderId`.
* `payment.repository` — transação decide + cria outbox.

### Integração (opcional, recomendado)

* **Postgres** com Testcontainers para validar Outbox e PaymentAttempt.
* **Kafka** (testcontainers) para verificar publicação de `payment.approved/rejected`.

**Comandos**

```bash
pnpm -F svc-payment prisma generate
pnpm -F svc-payment prisma migrate dev --name init_payment
pnpm -F svc-payment test -- --coverage
```

## Resultados

* `svc-payment` processa `payment.requested` e decide aprovar/rejeitar com regra configurável.
* Publicação resiliente dos eventos via **Outbox**; overrides admin simulam *webhooks* reais.
* Testes asseguram idempotência, registro de tentativas e integridade dos eventos.

## Próximos passos

* **Artigo 7 — Notification**: fan‑out de `order.completed`/`order.canceled` para e‑mail/whatsapp (mock) e templates.
* **Artigo 8 — Observability**: OpenTelemetry, métricas e dashboards (Grafana/Prometheus) acompanhando a SAGA ponta‑a‑ponta.

## English abstract

We build the `svc-payment` stub with an ACL that deterministically approves or rejects payments, ensuring idempotency per order. Events are published via an Outbox relay; admin overrides simulate provider webhooks. Tests cover decisions, attempts and event integrity.

---

# Artigo 7 — Notification (fan‑out) com templates (e‑mail/whatsapp mock)

**Título (SEO):** ECommerce SaaS #7 — Notification: e‑mail/WhatsApp (mock) com templates, deduplicação e reenvio
**Subtítulo:** Consumindo `order.completed`/`order.canceled`, renderizando templates HandleBars e registrando logs de envio

## Contexto & Problema

Ao final da SAGA, precisamos **notificar** cliente/ops sobre o desfecho: `order.completed` (sucesso) ou `order.canceled` (falha). Em produção, integraríamos provedores (SMTP, WhatsApp Business, etc.). Em **dev**, manteremos **adapters stub** e **transportes locais** (sem dependências externas) para validar formatos, idempotência e reenvio com segurança.

## Objetivos (SMART)

* [ ] Implementar `svc-notification` consumindo `order.completed`/`order.canceled`.
* [ ] Renderizar **templates** (Handlebars) para e‑mail/whatsapp.
* [ ] Registrar **NotificationLog** e garantir **deduplicação** por `message-id`.
* [ ] Expor endpoints **admin**: preview, enviar manual, reprocessar, listar logs.
* [ ] Cobertura ≥ **80%** (unit + integração básica).

## Arquitetura & Decisões

```mermaid
flowchart LR
  Kafka -->|order.completed| Notification
  Kafka -->|order.canceled| Notification
  subgraph Notification
    Consumer --> Service --> TemplateEngine
    Service --> EmailAdapter
    Service --> WhatsAppAdapter
    Service --> Repo
    Repo --> DB[(Postgres)]
  end
```

* **Deduplicação** por `ProcessedEvent(eventId)` (header `message-id`).
* **Adapters stub**:

  * **E‑mail** com **Nodemailer JSON transport** (gera JSON no log/db).
  * **WhatsApp**: simples console/logger (ou HTTP falso) — sem provedores reais.
* **Reenvio**: comandos admin para reenfileirar por `notificationId`.

## Arquivos & Estrutura

```
apps/
  svc-notification/
    prisma/
      schema.prisma
    src/
      infra/prisma/prisma.service.ts
      modules/notification/
        dto/
          send.dto.ts
        events.ts
        notification.repository.ts
        notification.service.ts
        notification.consumer.ts
        adapters/email.adapter.ts
        adapters/whatsapp.adapter.ts
        templates/
          email/order-completed.hbs
          email/order-canceled.hbs
          whatsapp/order-completed.hbs
          whatsapp/order-canceled.hbs
        notification.controller.ts
      main.ts
    .env
```

### 1) `.env` (apps/svc-notification/.env)

```ini
DATABASE_URL=postgresql://app:app@postgres:5432/saas_catalog?schema=public
KAFKA_CLIENT_ID=svc-notification
KAFKA_BROKERS=kafka:9092
KAFKA_GROUP_ID=notification-consumer
HTTP_PORT=3004
EMAIL_FROM="SaaS Store <no-reply@saas.dev>"
```

### 2) Prisma schema (apps/svc-notification/prisma/schema.prisma)

```prisma
datasource db { provider = "postgresql" url = env("DATABASE_URL") }

generator client { provider = "prisma-client-js" }

enum Channel { EMAIL WHATSAPP }

enum NotificationStatus { PENDING SENT ERROR }

model NotificationLog {
  id            String              @id @default(cuid())
  orderId       String
  channel       Channel
  to            String
  subject       String?
  template      String
  payload       Json
  status        NotificationStatus  @default(PENDING)
  lastError     String?
  correlationId String              @default("")
  causationId   String              @default("")
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt
}

model ProcessedEvent {
  id        String   @id @default(cuid())
  eventId   String   @unique
  createdAt DateTime @default(now())
}
```

### 3) Templates (exemplos)

`templates/email/order-completed.hbs`

```hbs
<h2>Pedido {{orderId}} confirmado ✅</h2>
<p>Olá {{customerName}},
seu pedido foi concluído com sucesso.
Total: R$ {{total}}.</p>
<p>Itens:</p>
<ul>
  {{#each items}}
    <li>{{this.qty}} × {{this.productId}}</li>
  {{/each}}
</ul>
<p>Obrigado por comprar conosco!</p>
```

`templates/email/order-canceled.hbs`

```hbs
<h2>Pedido {{orderId}} cancelado ❌</h2>
<p>Olá {{customerName}},
seu pedido foi cancelado.
Motivo: {{reason}}.</p>
```

(Análogos para `templates/whatsapp/*.hbs` com texto puro.)

### 4) Eventos (apps/svc-notification/src/modules/notification/events.ts)

```ts
export type OrderCompleted = { event: 'order.completed'; orderId: string; items: Array<{ productId: string; qty: number }>; total: number; correlationId: string; };
export type OrderCanceled  = { event: 'order.canceled';  orderId: string; reason: string; correlationId: string; };
```

### 5) Repositório (apps/svc-notification/src/modules/notification/notification.repository.ts)

```ts
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  log(input: { orderId: string; channel: 'EMAIL'|'WHATSAPP'; to: string; subject?: string; template: string; payload: any; status?: 'PENDING'|'SENT'|'ERROR'; correlationId?: string; causationId?: string; lastError?: string; }) {
    return this.prisma.notificationLog.create({ data: { ...input, status: (input.status as any) ?? 'PENDING', payload: input.payload } });
  }

  updateStatus(id: string, status: 'SENT'|'ERROR', lastError?: string) {
    return this.prisma.notificationLog.update({ where: { id }, data: { status: status as any, lastError } });
  }
}
```

### 6) Adapters

`adapters/email.adapter.ts`

```ts
import Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';
import nodemailer from 'nodemailer';

export class EmailAdapter {
  private transporter = nodemailer.createTransport({ jsonTransport: true });
  constructor(private base = join(__dirname, '..', 'templates', 'email')) {}

  render(template: string, data: any) {
    const hbs = readFileSync(join(this.base, template + '.hbs'), 'utf-8');
    return Handlebars.compile(hbs)(data);
  }

  async send(to: string, subject: string, html: string) {
    const from = process.env.EMAIL_FROM || 'no-reply@local';
    const info = await this.transporter.sendMail({ from, to, subject, html });
    return { ok: true, info };
  }
}
```

`adapters/whatsapp.adapter.ts`

```ts
import Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';

export class WhatsAppAdapter {
  constructor(private base = join(__dirname, '..', 'templates', 'whatsapp')) {}
  render(template: string, data: any) {
    const hbs = readFileSync(join(this.base, template + '.hbs'), 'utf-8');
    return Handlebars.compile(hbs)(data);
  }
  async send(to: string, text: string) {
    // Stub: apenas loga e retorna sucesso
    // Em prod: integrar com WhatsApp Business API / provedor
    console.log(`[WHATSAPP->${to}] ${text}`);
    return { ok: true };
  }
}
```

### 7) Service (apps/svc-notification/src/modules/notification/notification.service.ts)

```ts
import { Injectable, Logger } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { EmailAdapter } from './adapters/email.adapter';
import { WhatsAppAdapter } from './adapters/whatsapp.adapter';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  constructor(private readonly repo: NotificationRepository, private readonly email: EmailAdapter, private readonly wa: WhatsAppAdapter) {}

  async sendCompleted(payload: { orderId: string; total: number; items: Array<{ productId: string; qty: number }>; correlationId: string; customer: { email: string; phone: string; name: string } }) {
    const html = this.email.render('order-completed', { orderId: payload.orderId, total: payload.total, items: payload.items, customerName: payload.customer.name });
    const log = await this.repo.log({ orderId: payload.orderId, channel: 'EMAIL', to: payload.customer.email, subject: `Pedido ${payload.orderId} confirmado`, template: 'order-completed', payload, correlationId: payload.correlationId });
    try {
      await this.email.send(payload.customer.email, `Pedido ${payload.orderId} confirmado`, html);
      await this.repo.updateStatus(log.id, 'SENT');
    } catch (e: any) {
      await this.repo.updateStatus(log.id, 'ERROR', String(e?.message || e));
      this.logger.error(e);
    }

    const text = this.wa.render('order-completed', { orderId: payload.orderId, total: payload.total });
    await this.repo.log({ orderId: payload.orderId, channel: 'WHATSAPP', to: payload.customer.phone, template: 'order-completed', payload });
    await this.wa.send(payload.customer.phone, text);
  }

  async sendCanceled(payload: { orderId: string; reason: string; correlationId: string; customer: { email: string; phone: string; name: string } }) {
    const html = this.email.render('order-canceled', { orderId: payload.orderId, reason: payload.reason, customerName: payload.customer.name });
    const log = await this.repo.log({ orderId: payload.orderId, channel: 'EMAIL', to: payload.customer.email, subject: `Pedido ${payload.orderId} cancelado`, template: 'order-canceled', payload, correlationId: payload.correlationId });
    try {
      await this.email.send(payload.customer.email, `Pedido ${payload.orderId} cancelado`, html);
      await this.repo.updateStatus(log.id, 'SENT');
    } catch (e: any) {
      await this.repo.updateStatus(log.id, 'ERROR', String(e?.message || e));
      this.logger.error(e);
    }

    const text = this.wa.render('order-canceled', { orderId: payload.orderId, reason: payload.reason });
    await this.repo.log({ orderId: payload.orderId, channel: 'WHATSAPP', to: payload.customer.phone, template: 'order-canceled', payload });
    await this.wa.send(payload.customer.phone, text);
  }
}
```

### 8) Consumer (apps/svc-notification/src/modules/notification/notification.consumer.ts)

```ts
import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, KafkaContext, Payload } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { NotificationService } from './notification.service';

@Controller()
export class NotificationConsumer {
  private readonly logger = new Logger(NotificationConsumer.name);
  constructor(private readonly prisma: PrismaClient, private readonly service: NotificationService) {}

  private async dedupe(ctx: KafkaContext) {
    const eventId = ctx.getMessage().headers?.['message-id'];
    if (!eventId) return true;
    try { await this.prisma.processedEvent.create({ data: { eventId: String(eventId) } }); return true; } catch { return false; }
  }

  @EventPattern('order.completed')
  async onCompleted(@Payload() msg: any, @Ctx() ctx: KafkaContext) {
    if (!(await this.dedupe(ctx))) return;
    const v = msg.value ?? msg;
    // Enriquecimento mínimo (em prod, buscaríamos customer/contact num ACL)
    const customer = { email: 'customer@example.com', phone: '+5500000000000', name: 'Cliente' };
    await this.service.sendCompleted({ orderId: v.orderId, total: v.total, items: v.items ?? [], correlationId: v.correlationId, customer });
  }

  @EventPattern('order.canceled')
  async onCanceled(@Payload() msg: any, @Ctx() ctx: KafkaContext) {
    if (!(await this.dedupe(ctx))) return;
    const v = msg.value ?? msg;
    const customer = { email: 'customer@example.com', phone: '+5500000000000', name: 'Cliente' };
    await this.service.sendCanceled({ orderId: v.orderId, reason: v.reason, correlationId: v.correlationId, customer });
  }
}
```

### 9) Controller (admin) (apps/svc-notification/src/modules/notification/notification.controller.ts)

```ts
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly svc: NotificationService) {}

  @Post('send/completed')
  sendCompleted(@Body() body: any) { return this.svc.sendCompleted(body); }

  @Post('send/canceled')
  sendCanceled(@Body() body: any) { return this.svc.sendCanceled(body); }

  // Para visualizar um template renderizado rapidamente em dev
  @Post('preview')
  preview(@Body() body: { type: 'completed'|'canceled'; channel: 'email'|'whatsapp'; data: any }) { return { ok: true, preview: '...HTML/TEXT...' }; }
}
```

### 10) Bootstrap (apps/svc-notification/src/main.ts)

```ts
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(Number(process.env.HTTP_PORT || 3004));

  await app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: { client: { clientId: process.env.KAFKA_CLIENT_ID || 'svc-notification', brokers: (process.env.KAFKA_BROKERS || 'kafka:9092').split(',') }, consumer: { groupId: process.env.KAFKA_GROUP_ID || 'notification-consumer' } },
  });
  await app.startAllMicroservices();
}
bootstrap();
```

> **Swagger**: documente `/notification/send/*` e `/notification/preview`.
> **Segurança**: endpoints admin devem ser protegidos em ambientes compartilhados.

## Testes (TDD)

* **Unit**:

  * `email.adapter`/`whatsapp.adapter` — renderização e retorno esperado.
  * `notification.service` — logs criados, status atualizado, HTML/TXT gerados.
* **Integração**: consumer processa `order.completed` → gera dois logs (EMAIL+WHATSAPP) com `status=SENT`.

**Comandos**

```bash
pnpm -F svc-notification prisma generate
pnpm -F svc-notification prisma migrate dev --name init_notification
pnpm -F svc-notification test -- --coverage
```

## Resultados

* Notificações renderizadas a partir de **templates** com dados do pedido.
* **Deduplicação** evita reenvios em *replays* do Kafka.
* Logs detalhados para auditoria e **reenvio** controlado via endpoints admin.

## Próximos passos

* **Artigo 8 — Observability**: OTel tracing + métricas (Prometheus) + dashboards (Grafana) para seguir a SAGA fim‑a‑fim.
* **Artigo 9 — Segurança**: JWT/RBAC, Rate Limiter, CORS/Helmet, segredos.

## English abstract

We implement `svc-notification` to consume order lifecycle events and send e‑mail/WhatsApp (mock) using Handlebars templates. Deduplication prevents duplicate notifications, logs enable auditing and resend flows, and admin endpoints allow preview and manual triggers.

---

# TL;DR + Checklists de Publicação (Artigos 1–7)

> Pacote pronto para publicação rápida no **Medium** e compartilhamento no **LinkedIn**. Cada item traz: **TL;DR**, **Checklist de publicação**, **Metadados (Medium)** e **Post LinkedIn (PT/EN)**.

---

## Artigo 1 — Kickoff, Monorepo e Plano de SAGA

**TL;DR**
Organizamos o monorepo com **pnpm workspaces**, definimos os **Bounded Contexts** e os **serviços iniciais** (catalog, inventory, order/orchestrator). Alinhamos o **plano de SAGA** (pedido → estoque → pagamento → notificação) e os padrões de qualidade (TDD, lint, scripts).

**Checklist (Publicar)**

* [ ] Diagrama Mermaid atualizado
* [ ] Scripts `dev/build/test/lint` funcionando
* [ ] Links para commits/PRs
* [ ] Capa (diagrama resumido)

**Medium**

* **Título:** ECommerce SaaS #1 — Kickoff, Monorepo e plano de SAGA
* **Subtítulo:** Estruturando contextos e serviços para uma SAGA orquestrada
* **Slug sugerido:** ecommerce-saas-01-kickoff-monorepo-saga
* **Tags (≤5):** nodejs, microservices, saga, nestjs, tdd

**LinkedIn (PT)**
Comecei a série do **ECommerce SaaS**: monorepo com pnpm, contextos de domínio e plano de **SAGA orquestrada**. Base sólida para evoluir com TDD.
#NodeJS #NestJS #SAGA #Microservices #TDD

**LinkedIn (EN)**
Kicked off the **SaaS e‑commerce** series: pnpm monorepo, bounded contexts, and an **orchestrated SAGA** plan. Solid base to move fast with TDD.
#NodeJS #NestJS #SAGA #Microservices #TDD

---

## Artigo 2 — Catálogo com Prisma, Swagger e TDD

**TL;DR**
Modelamos `Product` no **Prisma**, entregamos CRUD com **NestJS** e **Swagger**, e cobrimos com testes. Documentamos o erro comum do **PrismaService** (quando não estende `PrismaClient`/client desatualizado) e como corrigir.

**Checklist (Publicar)**

* [ ] Schema Prisma versionado + migração
* [ ] Swagger com endpoints `/products`
* [ ] Testes ≥ 80%
* [ ] Nota sobre erro `Property 'product'...`

**Medium**

* **Título:** ECommerce SaaS #2 — Catálogo com Prisma, Swagger e TDD
* **Slug:** ecommerce-saas-02-catalog-prisma-swagger-tdd
* **Tags:** prisma, nestjs, typescript, testing, swagger

**LinkedIn (PT)**
No **Catálogo** implementei Prisma + Swagger com TDD e registrei a correção do erro clássico do PrismaService.
#Prisma #NestJS #Swagger #TDD #TypeScript

**LinkedIn (EN)**
Catalog service shipped with **Prisma + Swagger** under **TDD**, plus a fix for a frequent PrismaService pitfall.
#Prisma #NestJS #Swagger #TDD #TypeScript

---

## Artigo 3 — Infra local com Docker e Kafdrop

**TL;DR**
Stack local reprodutível com **Postgres, Redis, Kafka/ZooKeeper, Kafdrop** e **Prisma Studio** opcional. Volumes, *healthchecks* e comandos de *smoke test* para subir tudo com `docker compose up -d`.

**Checklist (Publicar)**

* [ ] `docker-compose.yml` validado
* [ ] `.env.example` + instruções
* [ ] Prints do **Kafdrop**
* [ ] Troubleshooting (Kafka listeners, DATABASE_URL)

**Medium**

* **Título:** ECommerce SaaS #3 — Docker dev stack: Postgres, Redis, Kafka e Kafdrop
* **Slug:** ecommerce-saas-03-docker-postgres-redis-kafka-kafdrop
* **Tags:** docker, kafka, postgres, devops, localdev

**LinkedIn (PT)**
Infra local pronta com **Docker**: Postgres, Redis, Kafka + **Kafdrop**. Subiu em segundos e padronizou o dev.
#Docker #Kafka #Postgres #DevOps

**LinkedIn (EN)**
Reproducible **Docker** setup: Postgres, Redis, Kafka + **Kafdrop**. Smooth local DX.
#Docker #Kafka #Postgres #DevOps

---

## Artigo 4 — Inventory (reserva/baixa) + eventos Kafka

**TL;DR**
Serviço de **Inventário** consome `order.created`, realiza **reserva atômica** com SQL condicional e publica `stock.reserved` ou `stock.rejected`. Endpoints admin para ajustar/inspecionar estoque; testes unitários e integração.

**Checklist (Publicar)**

* [ ] Diagrama de sequência SAGA
* [ ] SQL condicional (snippet)
* [ ] Contratos de evento
* [ ] Testes ≥ 80%

**Medium**

* **Título:** ECommerce SaaS #4 — Inventory: reserva atômica e eventos Kafka
* **Slug:** ecommerce-saas-04-inventory-reserva-kafka
* **Tags:** kafka, nestjs, postgres, patterns, testing

**LinkedIn (PT)**
O **Inventory** agora reserva estoque de forma **atômica** e emite eventos `stock.*`. Fluxo testado e observável.
#Kafka #NestJS #Postgres #SAGA

**LinkedIn (EN)**
**Inventory** performs **atomic** reservations and emits `stock.*` events. Solid foundations for the SAGA.
#Kafka #NestJS #Postgres #SAGA

---

## Artigo 5 — Orquestrador (svc-order) com Outbox e Timeouts

**TL;DR**
O **svc-order** inicia a SAGA, persiste **Order + Outbox** na mesma transação, publica confiável com **relay**, mantém **idempotência** de criação e aplica **timeouts** para `PAYMENT_PENDING`. Dedup em consumidores.

**Checklist (Publicar)**

* [ ] Schema (Order/Outbox/ProcessedEvent)
* [ ] Relay com headers (`message-id`, `correlation-id`)
* [ ] Scanner de timeout
* [ ] Testes de fluxo `stock.*` → `payment.*`

**Medium**

* **Título:** ECommerce SaaS #5 — Orquestrador: Outbox, Idempotência e Timeouts
* **Slug:** ecommerce-saas-05-orchestrator-outbox-idempotency-timeouts
* **Tags:** saga, outbox, idempotency, kafka, nestjs

**LinkedIn (PT)**
**Orquestrador** com **Outbox** transacional, **idempotência** e **timeouts**. Fluxo robusto entre estoque e pagamento.
#SAGA #Outbox #Kafka #NestJS

**LinkedIn (EN)**
**Orchestrator** with transactional **Outbox**, **idempotency**, and **payment timeouts**—robust event flow.
#SAGA #Outbox #Kafka #NestJS

---

## Artigo 6 — Payment (stub + ACL), aprova/rejeita

**TL;DR**
Stub de **Payment** com **ACL** decide de forma determinística (config por `PAYMENT_APPROVAL_LIMIT`) e publica `payment.approved/rejected` via **Outbox**. Idempotência por `orderId`, *attempt log* e endpoints admin para override.

**Checklist (Publicar)**

* [ ] Regra determinística destacada
* [ ] Outbox + attempts
* [ ] Endpoints admin (override)
* [ ] Testes ≥ 80%

**Medium**

* **Título:** ECommerce SaaS #6 — Payment stub + ACL: aprovação/rejeição confiáveis
* **Slug:** ecommerce-saas-06-payment-stub-acl
* **Tags:** payments, acl, outbox, nestjs, testing

**LinkedIn (PT)**
**Payment** com ACL (stub) decide aprovar/rejeitar e publica via **Outbox**. Idempotente e testado.
#Payments #ACL #Outbox #NestJS

**LinkedIn (EN)**
**Payment** stub with **ACL** deterministically approves/rejects and publishes via **Outbox**—idempotent and tested.
#Payments #ACL #Outbox #NestJS

---

## Artigo 7 — Notification (fan‑out) com templates

**TL;DR**
**Notification** consome `order.completed/canceled`, renderiza templates **Handlebars** para e‑mail/WhatsApp (mock), registra **NotificationLog** e evita duplicidade com `ProcessedEvent`. Endpoints para preview e reenvio.

**Checklist (Publicar)**

* [ ] Templates (email/whatsapp)
* [ ] Dedup (`ProcessedEvent`)
* [ ] Logs e reenvio admin
* [ ] Testes (unit + integração)

**Medium**

* **Título:** ECommerce SaaS #7 — Notification: templates e fan‑out (mock)
* **Slug:** ecommerce-saas-07-notification-templates-fanout
* **Tags:** notifications, handlebars, nestjs, kafka, testing

**LinkedIn (PT)**
**Notification** com templates (e‑mail/WhatsApp) e **deduplicação** para evitar reenvios. Logs e preview para acelerar o QA.
#Notifications #Kafka #NestJS #Handlebars

**LinkedIn (EN)**
**Notification** with templated e‑mail/WhatsApp (mock) and **deduplication**—logs and preview endpoints included.
#Notifications #Kafka #NestJS #Handlebars

---

## Dicas gerais de publicação

* **Capa**: diagrama/fluxo do artigo, legível em mobile.
* **Trechos de código curtos**: linkar para PRs/commits completos.
* **CTA padrão**: “Código e PRs no repositório · dúvidas? comente.”
* **Métricas**: adicione um parágrafo final com resultados (tempo de build, cobertura, publicação de eventos) quando houver.

---

# Artigo 8 — Observability (OpenTelemetry + Prometheus + Grafana)

**Título (SEO):** ECommerce SaaS #8 — Observability: tracing com OpenTelemetry + métricas Prometheus + dashboards Grafana
**Subtítulo:** Trace distribuído ponta‑a‑ponta (HTTP, Kafka, Prisma), métricas de serviço e dashboards prontos para a SAGA

## Contexto & Problema

Com vários microsserviços e SAGA orquestrada, **entender latências e gargalos** é crucial. Este artigo integra **OpenTelemetry** para *tracing distribuído*, **Prometheus** para métricas por serviço e **Grafana** para visualização. Focamos em: (1) instrumentos automáticos (HTTP/Express, Prisma), (2) **propagação de contexto no Kafka** e (3) **métricas técnicas** (latência, throughput, erros) com *dashboards* prontos.

## Objetivos (SMART)

* [ ] Habilitar **tracing** (OTel) em `svc-order`, `svc-inventory`, `svc-payment`, `svc-notification`.
* [ ] Injetar/Extrair **W3C tracecontext** em **headers do Kafka** (producer/consumer).
* [ ] Expor **/metrics** Prometheus por serviço (HTTP).
* [ ] Subir **Grafana + Prometheus + Tempo + OTel Collector** via Compose e criar painéis base.

## Arquitetura & Decisões

```mermaid
graph LR
  subgraph Services
    Order -->|HTTP/Kafka| Inventory
    Order -->|HTTP/Kafka| Payment
    Order -->|HTTP/Kafka| Notification
  end
  Services -->|OTLP gRPC| Otel[OTel Collector]
  Otel --> Tempo[(Grafana Tempo - Traces)]
  Services -->|/metrics scrape| Prometheus
  Prometheus --> Grafana
  Tempo --> Grafana
```

* **Traces** → OTel Collector → **Tempo** (backend de traces).
* **Métricas** → **Prometheus** via `/metrics` (Prom-client).
* **Grafana** como *single-pane-of-glass* (datasources: Prometheus + Tempo).

## Arquivos

### 1) Dependências por serviço

```bash
# OTel core
pnpm -F svc-order add @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-trace-otlp-grpc @opentelemetry/resources @opentelemetry/semantic-conventions
pnpm -F svc-inventory add @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-trace-otlp-grpc @opentelemetry/resources @opentelemetry/semantic-conventions
pnpm -F svc-payment add @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-trace-otlp-grpc @opentelemetry/resources @opentelemetry/semantic-conventions
pnpm -F svc-notification add @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-trace-otlp-grpc @opentelemetry/resources @opentelemetry/semantic-conventions

# Prisma instrumentation
pnpm -r add @prisma/instrumentation

# Métricas Prometheus
pnpm -r add @willsoto/nestjs-prometheus prom-client
```

### 2) Biblioteca compartilhada: `libs/observability/src/otel.ts`

```ts
// libs/observability/src/otel.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

export function initOTel(serviceName: string) {
  if (process.env.OTEL_DISABLED === '1') return;
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);
  const exporter = new OTLPTraceExporter({
    // OTel Collector (gRPC)
    url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || undefined,
  });
  const sdk = new NodeSDK({
    resource: new Resource({ [SemanticResourceAttributes.SERVICE_NAME]: serviceName }),
    traceExporter: exporter,
    instrumentations: [getNodeAutoInstrumentations({
      // http, express, @prisma/instrumentation etc. serão ativadas
      '@prisma/instrumentation': { enabled: true },
    })],
  });
  sdk.start();
  process.on('SIGTERM', () => sdk.shutdown());
}
```

### 3) Uso nos serviços (ex.: `apps/svc-order/src/main.ts`)

```ts
// Importar ANTES de NestFactory para instrumentar bootstrap
import { initOTel } from '@libs/observability/src/otel';
initOTel('svc-order');

// ... resto do bootstrap Nest
```

Repita para `svc-inventory`, `svc-payment`, `svc-notification` (mudando o nome do serviço).

### 4) Propagação no Kafka (producer/consumer)

```ts
// producer wrapper (ex.: order outbox relay)
import { context, propagation, trace } from '@opentelemetry/api';

// ... dentro do envio
const headers: Record<string, any> = {};
propagation.inject(context.active(), headers);
await producer.send({ topic, messages: [{ value: JSON.stringify(payload), headers }] });
```

```ts
// consumer (ex.: inventory.consumer.ts)
import { context, propagation, trace } from '@opentelemetry/api';

@EventPattern('order.created')
async onOrderCreated(@Payload() message: any, @Ctx() ctx: KafkaContext) {
  const carrier = message?.headers ?? ctx.getMessage().headers ?? {};
  const parentCtx = propagation.extract(context.active(), carrier);
  await context.with(parentCtx, async () => {
    const span = trace.getTracer('svc-inventory').startSpan('reserve');
    try {
      // ... lógica de reserva
    } finally { span.end(); }
  });
}
```

> Dica: inclua `correlationId` e `message-id` nos **atributos do span** para busca rápida.

### 5) Métricas `/metrics` com Prometheus

```ts
// apps/svc-order/src/app.module.ts (similar nos demais)
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [PrometheusModule.register({ path: '/metrics' })],
})
export class AppModule {}
```

Métricas úteis: `http_server_duration_seconds_*`, `process_cpu_user_seconds_total`, `nodejs_eventloop_lag_seconds`, contadores de *business events* (ex.: `ecommerce_orders_total`).

### 6) Compose: Collector, Tempo, Prometheus, Grafana

**`docker-compose.yml` (trecho a acrescentar na raiz)**

```yaml
  otel-collector:
    image: otel/opentelemetry-collector:0.103.0
    command: ["--config=/etc/otel-collector-config.yaml"]
    volumes:
      - ./observability/otel-collector-config.yaml:/etc/otel-collector-config.yaml
    ports:
      - "4317:4317"   # OTLP gRPC
    networks: [devnet]

  tempo:
    image: grafana/tempo:2.4.1
    command: ["-config.file=/etc/tempo.yaml"]
    volumes:
      - ./observability/tempo.yaml:/etc/tempo.yaml
    ports:
      - "3200:3200"   # Tempo HTTP
    networks: [devnet]

  prometheus:
    image: prom/prometheus:v2.54.1
    volumes:
      - ./observability/prometheus.yml:/etc/prometheus/prometheus.yml
    command: ["--config.file=/etc/prometheus/prometheus.yml","--web.enable-lifecycle"]
    ports:
      - "9090:9090"
    networks: [devnet]

  grafana:
    image: grafana/grafana:11.0.0
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_INSTALL_PLUGINS=grafana-piechart-panel
    ports:
      - "3000:3000"
    depends_on:
      - prometheus
      - tempo
    networks: [devnet]
```

**`observability/otel-collector-config.yaml`**

```yaml
receivers:
  otlp:
    protocols:
      grpc:
exporters:
  otlphttp/tempo:
    endpoint: http://tempo:3200
    traces_endpoint: http://tempo:3200/api/traces
  debug:
    verbosity: basic
processors:
  batch: {}
service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlphttp/tempo]
```

**`observability/tempo.yaml`** (mínimo)

```yaml
server:
  http_listen_port: 3200
storage:
  trace:
    backend: local
    wal:
      path: /tmp/tempo/wal
    local:
      path: /tmp/tempo/blocks
```

**`observability/prometheus.yml`**

```yaml
global:
  scrape_interval: 10s
scrape_configs:
  - job_name: svc-order
    static_configs: [{ targets: ["host.docker.internal:3001"] }]
  - job_name: svc-inventory
    static_configs: [{ targets: ["host.docker.internal:3002"] }]
  - job_name: svc-payment
    static_configs: [{ targets: ["host.docker.internal:3003"] }]
  - job_name: svc-notification
    static_configs: [{ targets: ["host.docker.internal:3004"] }]
```

> Ajuste `targets` se os serviços estiverem rodando em containers.

### 7) Variáveis de ambiente (serviços)

```ini
# .env de cada serviço
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=grpc://otel-collector:4317
OTEL_DISABLED=0
```

## Dashboards sugeridos (Grafana)

1. **Service Overview (por serviço)**

   * *Panels*: `http_requests_total` (por rota/status), `p95 http_server_duration_seconds_bucket`, CPU, memória, *event loop lag*.
2. **SAGA Latency**

   * *Panels*: Tempo Trace view + *Prometheus recording rule* p95 end‑to‑end (soma de spans principais).
3. **Kafka Ops**

   * *Panels*: contadores de mensagens processadas por tópico (adicione métricas nos consumers).

**Queries Prometheus (exemplos)**

* Latência p95 HTTP (histograma):

  ```promql
  histogram_quantile(0.95, sum(rate(http_server_duration_seconds_bucket[5m])) by (le, service))
  ```
* Taxa de requisições bem‑sucedidas:

  ```promql
  sum(rate(http_server_requests_total{status=~"2.."}[5m])) by (service)
  ```

## Passo a passo (Smoke)

1. `docker compose up -d otel-collector tempo prometheus grafana`
2. Startar serviços com OTel habilitado.
3. Criar um pedido → acompanhar no **Tempo** (via Grafana → *Explore → Tempo*) e checar spans encadeados (HTTP → Inventory → Payment → Notification).
4. Abrir **Prometheus** (`:9090`) e testar queries; fixar no **Grafana**.

## Resultados

* Tracing distribuído habilitado (HTTP, Prisma e **Kafka com contexto propagado**).
* Métricas de infraestrutura e app disponíveis via Prometheus.
* Dashboards no Grafana para **latência p95**, throughput e status da SAGA.

## Próximos passos

* **Artigo 9 — Segurança**: JWT, RBAC, Rate Limiter, CORS/Helmet, *secrets management*.
* **Aprimorar logs**: Loki/Promtail (stack *logs, metrics, traces* completa) e correlação com `trace_id`.

## English abstract

We add end‑to‑end observability: OpenTelemetry traces (HTTP, Prisma, and Kafka with context propagation) shipped to Tempo via the OTel Collector, Prometheus metrics exposed at `/metrics`, and Grafana dashboards for latency, throughput, and SAGA flow.

---

# Artigo 9 — Segurança (JWT, RBAC, Rate Limiter, CORS/Helmet, Secrets)

**Título (SEO):** ECommerce SaaS #9 — Segurança: JWT (+cookies HttpOnly), RBAC por rotas, Rate Limiter, CORS/Helmet e gestão de segredos
**Subtítulo:** Padronizando autenticação/autorização entre serviços e protegendo a superfície de ataque

## Contexto & Problema

Com múltiplos microsserviços e um gateway/API público, precisamos **padronizar autenticação, autorização e proteção** de camada web. Este artigo entrega um **núcleo de segurança reutilizável** (lib `auth-core`) com **JWT**, **RBAC**, *rate limiting*, **CORS/Helmet** e práticas de **segredos**, contemplando também o **fluxo por cookie HttpOnly** (compatível com BFF/Frontend) e o **fluxo Bearer token** (CLI/integrations).

## Objetivos (SMART)

* [ ] Criar `libs/auth-core` com **decorators/guards** (JWT + RBAC).
* [ ] Implementar **JWT Strategy** com *key rotation* e suporte a **cookies HttpOnly** e **Bearer**.
* [ ] Configurar **Rate Limiter** (Nest Throttler) + reforço no **Nginx (API Gateway)**.
* [ ] Ativar **CORS** e **Helmet** em todos os serviços HTTP.
* [ ] Padronizar **variáveis de ambiente** e leitura de **segredos** (arquivo/volume).
* [ ] Testes unitários/e2e de rotas protegidas (≥ **80%** do módulo).

## Arquitetura & Decisões

```mermaid
flowchart LR
  Client -->|Cookie HttpOnly / Bearer| APIGW[Nginx/API Gateway]
  APIGW --> Order
  APIGW --> Catalog
  APIGW --> Inventory
  APIGW --> Payment
  APIGW --> Notification
  subgraph Shared
    lib[libs/auth-core]
  end
  lib --> Order
  lib --> Catalog
  lib --> Inventory
  lib --> Payment
  lib --> Notification
```

* **Validação primária no Gateway** (Nginx) é recomendada (offload) + **revalidação** no serviço (zero trust).
* **JWT curto (access)** + **Refresh** com **cookie HttpOnly** emitido por **Auth Service** (futuro artigo).
* **RBAC** por *claims* (`roles`, `permissions`) e *decorators* na rota.
* **Rate limiting**: por IP/rota no gateway e por usuário/rota no serviço.
* **Segredos** via *env* + arquivo montado (`*_FILE`).

## Arquivos & Estrutura

```
libs/
  auth-core/
    src/
      index.ts
      roles.decorator.ts
      permissions.decorator.ts
      rbac.guard.ts
      jwt.strategy.ts
      auth.guard.ts
      auth.module.ts
      cookie.util.ts

apps/*/src/main.ts (CORS/Helmet/Throttler)

gateway/
  nginx.conf (rate limit + strip headers + forward)
```

### 1) `libs/auth-core/src/roles.decorator.ts`

```ts
import { SetMetadata } from '@nestjs/common';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

### 2) `libs/auth-core/src/permissions.decorator.ts`

```ts
import { SetMetadata } from '@nestjs/common';
export const PERMS_KEY = 'perms';
export const Permissions = (...perms: string[]) => SetMetadata(PERMS_KEY, perms);
```

### 3) `libs/auth-core/src/rbac.guard.ts`

```ts
import { CanActivate, ExecutionContext, Injectable, ForbiddenException, Reflector } from '@nestjs/common';
import { ROLES_KEY } from './roles.decorator';
import { PERMS_KEY } from './permissions.decorator';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user || {};
    const needRoles: string[] = this.reflector.getAllAndOverride(ROLES_KEY, [ctx.getHandler(), ctx.getClass()]) || [];
    const needPerms: string[] = this.reflector.getAllAndOverride(PERMS_KEY, [ctx.getHandler(), ctx.getClass()]) || [];
    const hasRoles = needRoles.every((r) => (user.roles || []).includes(r));
    const hasPerms = needPerms.every((p) => (user.permissions || []).includes(p));
    if (!hasRoles || !hasPerms) throw new ForbiddenException('RBAC: insufficient privileges');
    return true;
  }
}
```

### 4) `libs/auth-core/src/jwt.strategy.ts`

```ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as cookie from 'cookie';

function jwtFromRequest(req: any) {
  // 1) Cookie HttpOnly (preferencial)
  const c = req.headers?.cookie ? cookie.parse(req.headers.cookie) : {};
  if (c['access_token']) return c['access_token'];
  // 2) Authorization: Bearer
  return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
}

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest,
      secretOrKey: process.env.JWT_ACCESS_PUBLIC?.replace(/\n/g, '
'), // se usar RS256, aqui é PUBLIC KEY
      algorithms: ['HS256', 'RS256'],
      ignoreExpiration: false,
    });
  }
  validate(payload: any) {
    // payload esperado: { sub, email, roles, permissions, iat, exp, jti }
    return payload;
  }
}
```

> **Nota**: para **HS256**, use `JWT_ACCESS_SECRET`. Para **RS256**, use chaves `JWT_ACCESS_PRIVATE/JWT_ACCESS_PUBLIC` (rotacionáveis). Preferir **RS256**.

### 5) `libs/auth-core/src/auth.guard.ts`

```ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

### 6) `libs/auth-core/src/auth.module.ts`

```ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAccessStrategy } from './jwt.strategy';

@Module({
  imports: [JwtModule.register({})],
  providers: [JwtAccessStrategy],
  exports: [JwtAccessStrategy],
})
export class AuthCoreModule {}
```

### 7) Habilitar nos serviços (ex.: `apps/svc-order/src/app.module.ts`)

```ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthCoreModule, JwtAuthGuard } from '@libs/auth-core';
import { RbacGuard } from '@libs/auth-core';

@Module({
  imports: [AuthCoreModule],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RbacGuard },
  ],
})
export class AppModule {}
```

### 8) Exemplo de rota protegida (Inventory admin)

```ts
@Roles('admin')
@Permissions('inventory:adjust')
@Post('inventory/adjust')
adjust(...) { ... }
```

### 9) CORS/Helmet/Throttler por serviço (em `main.ts`)

```ts
import helmet from 'helmet';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

app.enableCors({
  origin: [/^https?:\/\/localhost:3[0-9]{3}$/],
  credentials: true,
});
app.use(helmet({
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
  contentSecurityPolicy: false, // ajustar conforme front
}));
```

Em `AppModule` de cada serviço:

```ts
imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }])],
providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }]
```

### 10) Rate limit no Gateway (Nginx)

**`gateway/nginx.conf`**

```nginx
http {
  limit_req_zone $binary_remote_addr zone=reqs:10m rate=10r/s;  # baseline
  server {
    listen 8080;
    set $upstream http://svc-api;

    # Bloqueia cabeçalhos sensíveis vindos do cliente
    proxy_set_header x-user-id "";
    proxy_set_header x-roles "";

    location / {
      limit_req zone=reqs burst=20 nodelay;
      proxy_pass $upstream;
    }
  }
}
```

> **Dica:** valide JWT no gateway via **lua-resty-jwt** ou *auth_request* para um **Auth Service** (OPA/Keycloak alternativos). Serviços **revalidam** com `JwtAuthGuard`.

### 11) Segredos e variáveis de ambiente

Padrão `*_FILE` para leitura por arquivo (útil com containers):

```bash
# .env
JWT_ACCESS_SECRET_FILE=/run/secrets/jwt_access_secret
```

Leitura no `bootstrap`:

```ts
import { readFileSync } from 'fs';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || (process.env.JWT_ACCESS_SECRET_FILE ? readFileSync(process.env.JWT_ACCESS_SECRET_FILE, 'utf-8').trim() : undefined);
```

**Boas práticas**

* Rotacionar chaves (`kid` no header JWT).
* TTL curto para Access (5–15min) + Refresh (dias) em cookie **HttpOnly** + `SameSite=Lax/Strict` + `Secure` em prod.
* `X-Forwarded-Proto`/`Host` corretos para cookies no gateway.
* Centralizar revogação em **Redis** (denylist por `jti`) quando necessário.

## Testes (TDD)

* **Unit**: `jwt.strategy` (cookie vs bearer), `rbac.guard` (roles/perms), *helpers* de cookie.
* **e2e**: rota protegida falha sem token; sucesso com token válido; 429 no rate limit após N reqs; CORS *preflight* OK.
* **Segurança**: header injection (garantir *strip* no gateway), cookie com `HttpOnly` e `Secure` no ambiente de preview.

**Comandos**

```bash
pnpm -r add @nestjs/passport passport passport-jwt cookie helmet @nestjs/throttler @nestjs/config zod
pnpm -r test -- --coverage
```

## Resultados

* **Autenticação** padronizada (JWT com cookie HttpOnly ou Bearer) em todos os serviços.
* **Autorização** RBAC declarativa por decorators/guards.
* **Proteções web** (CORS, Helmet) e **rate limiting** dupla camada (gateway + serviço).
* **Segredos** lidos com segurança via arquivo/volume, prontos para rotação.

## Próximos passos

* **Artigo 10 — Delivery**: imagens Docker, GitHub Actions (build/test/scan/push), ambientes de *preview* e manifests K8s.
* Alternativas de **IAM/IdP**: Keycloak/OPA e políticas declarativas como evolução do RBAC.

## English abstract

We standardize security across services: JWT (HttpOnly cookies or Bearer), declarative RBAC guards, dual‑layer rate limiting (Nginx + Nest Throttler), CORS/Helmet hardening, and safe secret handling via env‑file patterns and rotation. Tests cover auth flows and rate limits.

---

# Artigo 10 — Delivery (Docker images, CI/CD, Previews e K8s)

**Título (SEO):** ECommerce SaaS #10 — Delivery: Docker images, GitHub Actions CI/CD, ambientes de preview e manifests Kubernetes
**Subtítulo:** Pipeline de build/test/scan/push, deploy por serviço, e previews efêmeros por PR

## Contexto & Problema

Com os serviços prontos (Order, Inventory, Payment, Notification e Catalog), precisamos de **entrega contínua** previsível: *builds reprodutíveis*, **imagens seguras**, **previews por PR** e **deploy** em **Kubernetes** com *rollout* seguro. Este artigo entrega o esqueleto de **Dockerfiles**, **GitHub Actions**, **scans** (Trivy/Syft), *signing* opcional (Cosign), e **manifests K8s** com *healthchecks* e HPA.

## Objetivos (SMART)

* [ ] Publicar imagens Docker por serviço com **tags semânticas** + `sha`.
* [ ] **CI**: lint/test, cobertura, build multi‑stage com cache, **scan** e **SBOM**.
* [ ] **CD**: deploy no K8s com *rolling update* e **HPA**; *rollback* simples.
* [ ] **Previews por PR**: namespace efêmero (K8s) ou *compose* isolado.

## Arquitetura & Decisões

```mermaid
flowchart LR
  Dev -->|push/PR| GitHub
  GitHub -->|CI: test->build->scan->push| GHCR[(Container Registry)]
  GHCR -->|CD| K8s[(Cluster)]
  GitHub -->|Preview on PR| K8s
  subgraph K8s
    Deploy[Deployment per service]
    Svc[Service/Ingress]
    HPA[HorizontalPodAutoscaler]
  end
```

* **Imagens por serviço** (`svc-*`) com **multi‑stage** e usuário não‑root.
* **Tags**: `vX.Y.Z` quando houver release + `sha` sempre (`vX.Y.Z-<sha>` e `sha-<7>`).
* **Previews**: `pr-<n>` em namespace próprio ou compose isolado.

## Arquivos

### 1) `.dockerignore` (raiz)

```
node_modules
.git
.gitignore
Dockerfile*
**/.env*
**/coverage
**/dist
**/.turbo
**/.next
```

### 2) `apps/svc-order/Dockerfile` (aplique o padrão aos demais)

```dockerfile
# ---- builder ----
FROM node:20-alpine AS builder
WORKDIR /workspace
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
COPY apps ./apps
COPY libs ./libs
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm -w install --frozen-lockfile
RUN pnpm -F svc-order build && pnpm -r prune --prod

# ---- runner ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S nodejs && adduser -S node -G nodejs
COPY --from=builder /workspace/apps/svc-order/dist ./dist
COPY --from=builder /workspace/apps/svc-order/node_modules ./node_modules
COPY --from=builder /workspace/apps/svc-order/package.json ./package.json
USER node
EXPOSE 3001
HEALTHCHECK --interval=10s --timeout=3s --retries=10 CMD node -e "fetch('http://localhost:3001/health').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"
CMD ["node","dist/main.js"]
```

> **Notas**: usar `HEALTHCHECK` HTTP; `USER node`; cache do pnpm no *builder*.

### 3) GitHub Actions — CI/CD (`.github/workflows/ci-cd.yml`)

```yaml
name: ci-cd
on:
  push:
    branches: [main]
    tags: ['v*.*.*']
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        svc: [svc-order, svc-inventory, svc-payment, svc-notification, svc-catalog]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - name: Enable corepack
        run: corepack enable
      - uses: actions/cache@v4
        with:
          path: ~/.local/share/pnpm/store
          key: pnpm-${{ runner.os }}-${{ hashFiles('pnpm-lock.yaml') }}
      - name: Install
        run: pnpm -w install --frozen-lockfile
      - name: Test ${{ matrix.svc }}
        run: pnpm -F ${{ matrix.svc }} test -- --coverage

  build_push:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
      id-token: write # para cosign (OIDC)
    strategy:
      matrix:
        svc: [svc-order, svc-inventory, svc-payment, svc-notification, svc-catalog]
    steps:
      - uses: actions/checkout@v4
      - name: Docker meta
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}/${{ matrix.svc }}
          tags: |
            type=raw,value=sha-${{ github.sha }}
            type=raw,value=pr-${{ github.event.number }},enable=${{ github.event_name == 'pull_request' }}
            type=semver,pattern={{version}},enable=${{ startsWith(github.ref, 'refs/tags/v') }}
      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3
      - name: Set up Buildx
        uses: docker/setup-buildx-action@v3
      - name: Login GHCR
        uses: docker/login-action@v3
        with: { registry: ghcr.io, username: ${{ github.actor }}, password: ${{ secrets.GITHUB_TOKEN }} }
      - name: Build & push
        uses: docker/build-push-action@v6
        with:
          context: .
          file: apps/${{ matrix.svc }}/Dockerfile
          push: true
          platforms: linux/amd64
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=registry,ref=ghcr.io/${{ github.repository }}/${{ matrix.svc }}:buildcache
          cache-to: type=registry,ref=ghcr.io/${{ github.repository }}/${{ matrix.svc }}:buildcache,mode=max

  scan_sbom:
    needs: build_push
    runs-on: ubuntu-latest
    strategy:
      matrix:
        svc: [svc-order, svc-inventory, svc-payment, svc-notification, svc-catalog]
    steps:
      - name: Trivy scan
        uses: aquasecurity/trivy-action@0.20.0
        with:
          image-ref: ghcr.io/${{ github.repository }}/${{ matrix.svc }}:sha-${{ github.sha }}
          format: table
          exit-code: '1'
          vuln-type: 'os,library'
          severity: 'CRITICAL,HIGH'
      - name: SBOM (Syft)
        uses: anchore/sbom-action@v0
        with:
          image: ghcr.io/${{ github.repository }}/${{ matrix.svc }}:sha-${{ github.sha }}
          artifact-name: sbom-${{ matrix.svc }}.spdx.json

  sign:
    needs: build_push
    runs-on: ubuntu-latest
    steps:
      - name: Cosign install
        uses: sigstore/cosign-installer@v3
      - name: Cosign sign (keyless)
        run: cosign sign ghcr.io/${{ github.repository }}/${{ matrix.svc }}:sha-${{ github.sha }} --yes
```

> **Política de qualidade**: `scan_sbom` falha o PR em **CRITICAL/HIGH**. Ajuste severidades conforme maturidade.

### 4) Previews por PR (K8s efêmero)

`Preview` com namespace por PR: `ns=pr-<n>`, imagens `:pr-<n>`.

`.github/workflows/preview.yml` (resumo)

```yaml
name: preview
on:
  pull_request:
    types: [opened, synchronize, reopened]
  pull_request_target:
    types: [closed]

jobs:
  deploy:
    if: github.event.action != 'closed'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: azure/k8s-set-context@v3
        with: { method: kubeconfig, kubeconfig: ${{ secrets.KUBECONFIG }} }
      - name: Create ns
        run: kubectl get ns pr-${{ github.event.number }} || kubectl create ns pr-${{ github.event.number }}
      - name: Kustomize set image
        run: |
          kustomize build k8s/overlays/preview | sed "s/:latest/:pr-${{ github.event.number }}/g" | kubectl -n pr-${{ github.event.number }} apply -f -
  cleanup:
    if: github.event.action == 'closed'
    runs-on: ubuntu-latest
    steps:
      - uses: azure/k8s-set-context@v3
        with: { method: kubeconfig, kubeconfig: ${{ secrets.KUBECONFIG }} }
      - run: kubectl delete ns pr-${{ github.event.number }} --ignore-not-found
```

> Alternativa: **docker‑compose** preview local atrelado ao PR (`--project-name pr-<n>`), útil sem cluster.

### 5) Manifests K8s — base (ex.: `k8s/base/svc-order`)

`deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: svc-order
spec:
  replicas: 2
  strategy: { type: RollingUpdate, rollingUpdate: { maxUnavailable: 0, maxSurge: 1 } }
  selector: { matchLabels: { app: svc-order } }
  template:
    metadata: { labels: { app: svc-order } }
    spec:
      securityContext: { runAsNonRoot: true }
      containers:
        - name: app
          image: ghcr.io/ORG/REPO/svc-order:latest
          imagePullPolicy: IfNotPresent
          ports: [{ containerPort: 3001 }]
          env:
            - { name: NODE_ENV, value: production }
            - { name: KAFKA_BROKERS, valueFrom: { configMapKeyRef: { name: platform-config, key: KAFKA_BROKERS } } }
            - { name: DATABASE_URL, valueFrom: { secretKeyRef: { name: svc-order-secrets, key: DATABASE_URL } } }
            - { name: OTEL_EXPORTER_OTLP_TRACES_ENDPOINT, value: grpc://otel-collector:4317 }
          readinessProbe: { httpGet: { path: /health, port: 3001 }, initialDelaySeconds: 10, periodSeconds: 5 }
          livenessProbe:  { httpGet: { path: /health, port: 3001 }, initialDelaySeconds: 20, periodSeconds: 10 }
          resources:
            requests: { cpu: "100m", memory: "128Mi" }
            limits:   { cpu: "500m", memory: "512Mi" }
```

`service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata: { name: svc-order }
spec:
  selector: { app: svc-order }
  ports: [{ name: http, port: 80, targetPort: 3001 }]
```

`hpa.yaml`

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: { name: svc-order }
spec:
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: svc-order }
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource: { name: cpu, target: { type: Utilization, averageUtilization: 70 } }
```

`ingress.yaml` (Ingress NGINX + cert‑manager)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt
spec:
  tls:
    - hosts: [api.saas.local]
      secretName: api-tls
  rules:
    - host: api.saas.local
      http:
        paths:
          - path: /
            pathType: Prefix
            backend: { service: { name: svc-order, port: { number: 80 } } }
```

### 6) Kustomize — overlays (`k8s/overlays/dev|staging|prod`)

`k8s/overlays/dev/kustomization.yaml`

```yaml
resources:
  - ../../base/svc-order
  # ... outros serviços
images:
  - name: ghcr.io/ORG/REPO/svc-order
    newTag: sha-REPLACEME
configMapGenerator:
  - name: platform-config
    literals:
      - KAFKA_BROKERS=kafka:9092
```

> Staging/Prod trocam `newTag` e variáveis; aplique `kubectl -k k8s/overlays/dev`.

### 7) Rollout e Rollback

* **Rollout**: `kubectl rollout status deploy/svc-order`.
* **Rollback**: `kubectl rollout undo deploy/svc-order --to-revision=REV`.
* **Gating**: usar *readinessProbe* e checagens automatizadas no pipeline antes de avançar entre ambientes.

### 8) Segredos no pipeline

* Usar **GitHub Environments** com *secrets* por *env* (dev/stage/prod).
* OIDC → *cloud registry* sem senhas.
* Opcional: **SOPS/age** para criptografar manifests sensíveis no repositório.

## Passo a passo (Smoke)

1. **CI**: abrir PR → testes rodam; build `:pr-<n>`; *Trivy* e *SBOM*.
2. **Preview**: namespace `pr-<n>` criado; acessar Ingress (`pr-<n>.api.saas.local`).
3. **Merge**: *pipeline* `main` publica `:sha` e `:vX.Y.Z` (se tag); `kustomize` aplica nos ambientes.

## Resultados

* Imagens reprodutíveis e **seguras** (scan + SBOM + assinatura opcional).
* **CI/CD** padronizado por serviço com cache agressivo.
* **Previews efêmeros** facilitam QA e revisão técnica.
* **Kubernetes** com *healthchecks*, HPA e *rollbacks* simples.

## Próximos passos

* **Artigo 11 (bônus)** — API Gateway (Nginx/Traefik) + BFF e roteamento por contexto.
* **Argo CD/Rollouts** para *GitOps* e *canary/blue‑green*.
* **Policy as Code** (OPA/Conftest) para *gatekeeping* de manifests e imagens.

## English abstract

We finalize the delivery pipeline: multi‑stage Docker builds, GitHub Actions for test/build/scan/push, signed images and SBOMs, ephemeral PR previews, and Kubernetes manifests (readiness/liveness, HPA, rolling updates). Simple rollbacks and environment overlays complete the setup.
