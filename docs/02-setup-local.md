# 2. Setup Local (dev no host)

## Pré-requisitos
- Node 20.x, pnpm 9.x
- Docker & Docker Compose
- MySQL/Mongo/Redis/Kafka (usaremos o compose da infra)

## 1) Subir infra com volumes
```bash
docker compose -f docker-compose.infra.yml up -d
