#!/usr/bin/env bash
set -euo pipefail

# --------- Config ---------
BROKERS="${KAFKA_BROKERS:-kafka:9092}"
ORDER_URL="${ORDER_URL:-http://svc-order:3001}"
MONGO_URL="${MONGO_URL:-mongodb://mongo:27017}"
MONGO_DB="${MONGO_DB:-orchestrator}"
TENANT_ID="${TENANT_ID:-11111111-1111-1111-1111-111111111111}"
TIMEOUT="${E2E_TIMEOUT:-40}"

# tópicos
TOPIC_OUTBOX="outbox.v1.events"
TOP_RESERVE="inventory.v1.commands.reserve"
TOP_INV_RESERVED="inventory.v1.events.reserved"
TOP_INV_FAILED="inventory.v1.events.failed"
TOP_PAY_AUTH="payment.v1.events.authorized"
TOP_PAY_FAILED="payment.v1.events.failed"
TOP_SHIP_PREP="shipping.v1.events.prepared"
TOP_ORDER_CONF="order.v1.events.confirmed"
TOP_ORDER_FAIL="order.v1.events.failed"

# --------- Helpers ---------
say() { echo -e "\033[1;34m[ E2E ]\033[0m $*"; }
ok () { echo -e "\033[1;32m[ OK ]\033[0m $*"; }
err() { echo -e "\033[1;31m[ERR ]\033[0m $*" 1>&2; }

need() {
  command -v "$1" >/dev/null 2>&1 || { err "Faltando '$1'"; exit 1; }
}

# Instala driver MongoDB para uso no Node (local ao container e2e)
ensure_node_mongo() {
  node -e 'require("mongodb")' >/dev/null 2>&1 && return 0
  say "Instalando driver mongodb@6"
  npm init -y >/dev/null 2>&1 || true
  npm i mongodb@6 --silent
}

# Publica pedido no svc-order e retorna o ID (lido do JSON)
post_order() {
  local amount="$1"
  local code
  code="$(tr -dc 'A-Z0-9' </dev/urandom | head -c 6)"
  say "Criando pedido amount=${amount} code=${code}"

  local resp
  set +e
  resp="$(curl -fsS -X POST "${ORDER_URL}/orders" \
    -H 'content-type: application/json' \
    --data-binary @- <<JSON
{ "code":"${code}", "tenantId":"${TENANT_ID}", "items":[ { "productId":"11111111-1111-1111-1111-111111111111", "quantity":1, "unitPrice":${amount}, "total":${amount} } ] }
JSON
  )"
  local rc=$?
  set -e
  if [ $rc -ne 0 ]; then
    err "Falha ao criar pedido (HTTP). Verifique se svc-order está ok em ${ORDER_URL}"
    exit 1
  fi
  echo "$resp" | jq -r '.id'
}

# Consome uma mensagem que contenha o orderId (no valor JSON) a partir do "latest".
# Usa consumer-group único para não reprocessar histórico.
consume_for_order() {
  local topic="$1"
  local orderId="$2"
  local group="e2e-$RANDOM-$$-$(date +%s)"
  local end=$((SECONDS + TIMEOUT))

  # Lê mensagens novas (auto.offset.reset=latest) até encontrar o orderId
  while [ $SECONDS -lt $end ]; do
    # -X auto.offset.reset=latest garante começar do fim para um grupo novo
    # -c 1 lê uma mensagem e retorna (loop reaplica)
    local out
    out="$(kcat -b "$BROKERS" -G "$group" -X enable.partition.eof=false -X auto.offset.reset=latest \
                 -C -t "$topic" -u -J -q -c 1 2>/dev/null || true)"
    if [ -n "$out" ]; then
      # Filtra por orderId no payload
      echo "$out" | jq -e --arg id "$orderId" '
        try ((.payload|tostring|test($id)) or (.|tostring|test($id))) catch false
      ' >/dev/null 2>&1 && { echo "$out"; return 0; }
    fi
  done
  return 1
}

# Busca doc no Mongo (via Node)
mongo_get_history() {
  local orderId="$1"
  node - <<'NODE' "$MONGO_URL" "$MONGO_DB" "$orderId"
const [url, dbName, orderId] = process.argv.slice(2);
const { MongoClient } = require('mongodb');
(async () => {
  const cli = await MongoClient.connect(url, { ignoreUndefined: true });
  const db = cli.db(dbName);
  const doc = await db.collection('order_history').findOne({ orderId });
  console.log(JSON.stringify(doc, null, 2));
  await cli.close();
})().catch(e => { console.error(e); process.exit(1); });
NODE
}

# --------- Pre-check ---------
need curl
need jq
need kcat
ensure_node_mongo

say "Brokers: $BROKERS"
say "svc-order: $ORDER_URL"
say "Mongo: $MONGO_URL / DB=$MONGO_DB"
say "Timeout por etapa: ${TIMEOUT}s"

# --------- HAPPY PATH ---------
say "=== Cenário 1: happy path (valor baixo) ==="
ORDER_ID_OK="$(post_order 49)"
say "orderId = ${ORDER_ID_OK}"

say "Aguardando Reserve → ${TOP_RESERVE}"
consume_for_order "$TOP_RESERVE" "$ORDER_ID_OK" >/dev/null || { err "Reserve não apareceu a tempo"; exit 1; }
ok "Reserve OK"

say "Aguardando PaymentAuthorized → ${TOP_PAY_AUTH}"
consume_for_order "$TOP_PAY_AUTH" "$ORDER_ID_OK" >/dev/null || { err "PaymentAuthorized não apareceu a tempo"; exit 1; }
ok "PaymentAuthorized OK"

say "Aguardando ShippingPrepared → ${TOP_SHIP_PREP}"
consume_for_order "$TOP_SHIP_PREP" "$ORDER_ID_OK" >/dev/null || { err "ShippingPrepared não apareceu a tempo"; exit 1; }
ok "ShippingPrepared OK"

say "Aguardando OrderConfirmed → ${TOP_ORDER_CONF}"
consume_for_order "$TOP_ORDER_CONF" "$ORDER_ID_OK" >/dev/null || { err "OrderConfirmed não apareceu a tempo"; exit 1; }
ok "OrderConfirmed OK"

say "Consultando histórico no Mongo (happy)"
mongo_get_history "$ORDER_ID_OK" || true

# --------- PAYMENT FAIL ---------
say "=== Cenário 2: falha de pagamento (valor alto) ==="
ORDER_ID_FAIL="$(post_order 60)"
say "orderId = ${ORDER_ID_FAIL}"

say "Aguardando Reserve → ${TOP_RESERVE}"
consume_for_order "$TOP_RESERVE" "$ORDER_ID_FAIL" >/dev/null || { err "Reserve não apareceu (fail case)"; exit 1; }
ok "Reserve OK"

say "Aguardando PaymentFailed → ${TOP_PAY_FAILED}"
consume_for_order "$TOP_PAY_FAILED" "$ORDER_ID_FAIL" >/dev/null || { err "PaymentFailed não apareceu"; exit 1; }
ok "PaymentFailed OK"

say "Aguardando ReleaseInventory → ${TOP_INV_FAILED} ou comando release"
if consume_for_order "$TOP_INV_FAILED" "$ORDER_ID_FAIL" >/dev/null; then
  ok "InventoryFailed
