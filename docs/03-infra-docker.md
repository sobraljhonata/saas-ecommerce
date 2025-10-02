## 1) Subir infra + apps no cluster
```bash
docker compose -f docker-compose.infra.yml -f docker-compose.apps.yml up -d --build
