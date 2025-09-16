import { Kafka } from "kafkajs";

export function createKafka(brokers: string) {
  return new Kafka({ clientId: "saas-commerce", brokers: brokers.split(",") });
}

export const Topics = {
  ProductEvents: "catalog.v1.events.product",
  Outbox: "outbox.v1.events",
  OrderCommands: { Confirm: "order.v1.commands.confirm" },
  OrderEvents: { Placed: "order.v1.events.placed", Confirmed: "order.v1.events.confirmed", Failed: "order.v1.events.failed" },
  InventoryCommands: { Reserve: "inventory.v1.commands.reserve", Release: "inventory.v1.commands.release" },
  InventoryEvents: { Reserved: "inventory.v1.events.reserved", Failed: "inventory.v1.events.failed", Released: "inventory.v1.events.released" },
  PaymentCommands: { Authorize: "payment.v1.commands.authorize", Refund: "payment.v1.commands.refund" },
  PaymentEvents: { Authorized: "payment.v1.events.authorized", Failed: "payment.v1.events.failed", Refunded: "payment.v1.events.refunded" },
  ShippingCommands: { Prepare: "shipping.v1.commands.prepare" },
  ShippingEvents: { Prepared: "shipping.v1.events.prepared", Failed: "shipping.v1.events.failed" }
} as const;

export type BusEnvelope<T = unknown> = {
  type: string;
  aggregate: string;
  aggregateId: string;
  payload: T;
  createdAt: string;
  messageId?: string;
  tenantId?: string;
};

export type ProductCreatedEvent = {
  type: "ProductCreated";
  productId: string;
  categoryId: string;
  price: number;
  tenantId: string;
  occurredAt: string;
}
