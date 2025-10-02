# ADR-0001: SAGA orquestrada no Kafka

- **Status**: Aceito
- **Data**: 2025-09-xx

## Contexto
Precisamos coordenar criação de pedido envolvendo múltiplos bounded contexts (estoque, pagamento, envio) com consistência eventual.

## Decisão
Usar **SAGA orquestrada** com um **orchestrator** central e comunicação via **Kafka** (comandos/eventos).

## Consequências
- + Fluxo/compensações explícitos
- + Observabilidade por tópico/etapa
- – Orquestrador é ponto crítico (precisa HA/monitoramento)

## Alternativas
- SAGA coreografada (eventos puros): simplicidade no início, complexidade de coordenação/compensação depois.
