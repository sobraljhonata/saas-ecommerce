
#!/usr/bin/env python3
import argparse
import json
import sys
import time
import uuid
from typing import List, Tuple

from kafka import KafkaAdminClient, KafkaProducer, KafkaConsumer
from kafka.admin import NewTopic
from kafka.errors import TopicAlreadyExistsError
from pymongo import MongoClient

TOPICS = [
    'outbox.v1.events',
    'inventory.v1.commands.reserve','inventory.v1.commands.release',
    'inventory.v1.events.reserved','inventory.v1.events.released','inventory.v1.events.failed',
    'payment.v1.commands.authorize','payment.v1.commands.refund',
    'payment.v1.events.authorized','payment.v1.events.failed','payment.v1.events.refunded',
    'shipping.v1.commands.prepare',
    'shipping.v1.events.prepared','shipping.v1.events.failed',
    'order.v1.commands.confirm',
    'order.v1.events.confirmed','order.v1.events.failed',
]

def ensure_topics(bootstrap: str):
    admin = KafkaAdminClient(bootstrap_servers=bootstrap, client_id="e2e-admin")
    to_create = [NewTopic(name=t, num_partitions=1, replication_factor=1) for t in TOPICS]
    try:
        admin.create_topics(new_topics=to_create, validate_only=False)
    except TopicAlreadyExistsError:
        pass
    except Exception as e:
        # If auto-create is enabled or topics already exist, this may fail — continue
        print(f"[warn] create_topics: {e}", file=sys.stderr)
    finally:
        admin.close()

def make_producer(bootstrap: str) -> KafkaProducer:
    return KafkaProducer(
        bootstrap_servers=bootstrap,
        key_serializer=lambda k: k.encode("utf-8") if isinstance(k, str) else k,
        value_serializer=lambda v: json.dumps(v).encode("utf-8"),
        linger_ms=10,
        retries=3,
        acks="all",
    )

def make_consumer(bootstrap: str, group_id: str, topics: List[str]) -> KafkaConsumer:
    c = KafkaConsumer(
        *topics,
        bootstrap_servers=bootstrap,
        group_id=group_id,
        enable_auto_commit=True,
        auto_offset_reset="latest",
        value_deserializer=lambda v: json.loads(v.decode("utf-8")) if v else None,
        consumer_timeout_ms=1000,
    )
    return c

def wait_for_key(consumer: KafkaConsumer, topic: str, key: str, timeout_sec: float, require_type: str=None) -> dict:
    deadline = time.time() + timeout_sec
    while time.time() < deadline:
        records = consumer.poll(timeout_ms=250)
        for tp, batch in records.items():
            for rec in batch:
                k = rec.key.decode("utf-8") if rec.key else None
                if tp.topic == topic and k == key:
                    val = rec.value
                    if (require_type is None) or (val and val.get("type") == require_type):
                        return val
        time.sleep(0.05)
    raise TimeoutError(f"timeout waiting {timeout_sec}s for key={key} on {topic} type={require_type or '*'}")

def assert_timeline(mongo_url: str, db_name: str, order_id: str, expected_stages: List[str]) -> Tuple[bool, dict]:
    cli = MongoClient(mongo_url)
    db = cli.get_database(db_name)
    doc = db.get_collection("order_history").find_one({ "orderId": order_id })
    cli.close()
    if not doc:
        return False, {}
    stages = [s.get("stage") for s in doc.get("stages", [])]
    ok = all(stage in stages for stage in expected_stages)
    return ok, doc

def run_success(bootstrap: str, mongo_url: str, mongo_db: str) -> int:
    ensure_topics(bootstrap)
    order_id = "e2e-" + uuid.uuid4().hex[:10]

    producer = make_producer(bootstrap)
    topics = [
        'inventory.v1.events.reserved',
        'payment.v1.events.authorized',
        'shipping.v1.events.prepared',
        'order.v1.events.confirmed',
    ]
    consumer = make_consumer(bootstrap, group_id="e2e-saga-consumer", topics=topics)

    env = {
        "type": "OrderPlaced",
        "aggregate": "Order",
        "aggregateId": order_id,
        "payload": {
            "orderId": order_id,
            "items": [ { "sku": "SKU1", "quantity": 1, "unitPrice": 49, "total": 49 } ]
        },
        "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    producer.send("outbox.v1.events", key=order_id, value=env)
    producer.flush()
    print(f"[success] sent OrderPlaced for {order_id}")

    wait_for_key(consumer, 'inventory.v1.events.reserved', order_id, timeout_sec=30, require_type="InventoryReserved")
    print("[success] saw InventoryReserved")
    wait_for_key(consumer, 'payment.v1.events.authorized', order_id, timeout_sec=30, require_type="PaymentAuthorized")
    print("[success] saw PaymentAuthorized")
    wait_for_key(consumer, 'shipping.v1.events.prepared', order_id, timeout_sec=30, require_type="ShippingPrepared")
    print("[success] saw ShippingPrepared")
    wait_for_key(consumer, 'order.v1.events.confirmed', order_id, timeout_sec=30)
    print("[success] saw OrderConfirmed")

    ok, doc = assert_timeline(mongo_url, mongo_db, order_id, ["OrderPlaced","InventoryReserved","PaymentAuthorized","ShippingPrepared"])
    if ok:
        print("[success] timeline ok in Mongo")
        return 0
    else:
        print("[warn] timeline missing stages; doc=", json.dumps(doc, indent=2, default=str))
        return 2

def run_fail(bootstrap: str, mongo_url: str, mongo_db: str) -> int:
    ensure_topics(bootstrap)
    order_id = "e2e-" + uuid.uuid4().hex[:10]

    producer = make_producer(bootstrap)
    topics = [
        'inventory.v1.events.reserved',
        'payment.v1.events.failed',
        'inventory.v1.events.released',
        'order.v1.events.failed',
    ]
    consumer = make_consumer(bootstrap, group_id="e2e-saga-consumer", topics=topics)

    env = {
        "type": "OrderPlaced",
        "aggregate": "Order",
        "aggregateId": order_id,
        "payload": {
            "orderId": order_id,
            "items": [ { "sku": "SKUX", "quantity": 1, "unitPrice": 60, "total": 60 } ]
        },
        "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
    producer.send("outbox.v1.events", key=order_id, value=env)
    producer.flush()
    print(f"[fail] sent OrderPlaced for {order_id} (amount 60)")

    wait_for_key(consumer, 'inventory.v1.events.reserved', order_id, timeout_sec=30, require_type="InventoryReserved")
    print("[fail] saw InventoryReserved")
    wait_for_key(consumer, 'payment.v1.events.failed', order_id, timeout_sec=30, require_type="PaymentFailed")
    print("[fail] saw PaymentFailed")
    wait_for_key(consumer, 'inventory.v1.events.released', order_id, timeout_sec=30)
    print("[fail] saw InventoryReleased")
    wait_for_key(consumer, 'order.v1.events.failed', order_id, timeout_sec=30)
    print("[fail] saw OrderFailed")

    ok, doc = assert_timeline(mongo_url, mongo_db, order_id, ["OrderPlaced"])
    if doc:
        print("[fail] timeline doc present in Mongo (details below)")
        print(json.dumps(doc, indent=2, default=str))
        return 0
    else:
        print("[warn] timeline doc not found for failed order")
        return 3

def main():
    ap = argparse.ArgumentParser(description="E2E SAGA test for orchestrator flow")
    ap.add_argument("--brokers", default="localhost:29092", help="Kafka bootstrap servers")
    ap.add_argument("--mongo-url", default="mongodb://localhost:27017", help="Mongo connection string")
    ap.add_argument("--mongo-db", default="orchestrator", help="Mongo database name")
    ap.add_argument("--mode", choices=["success", "fail", "both"], default="both")
    args = ap.parse_args()

    rc = 0
    try:
        if args.mode in ("success","both"):
            rc |= run_success(args.brokers, args.mongo_url, args.mongo_db)
        if args.mode in ("fail","both"):
            rc |= run_fail(args.brokers, args.mongo_url, args.mongo_db)
    except TimeoutError as te:
        print(f"[error] {te}", file=sys.stderr)
        sys.exit(10)
    except Exception as e:
        print(f"[error] {e}", file=sys.stderr)
        sys.exit(11)
    sys.exit(rc)
if __name__ == "__main__":
    main()
