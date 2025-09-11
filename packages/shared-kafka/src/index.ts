import { Kafka } from "kafkajs";

export function createKafka(brokers: string) {
  return new Kafka({ clientId: "saas-commerce", brokers: brokers.split(",") });
}

export const Topics = {
  ProductEvents: "catalog.v1.events.product",
  Outbox: "outbox.v1.events"
} as const;

export type ProductCreatedEvent = {
  type: "ProductCreated";
  productId: string;
  categoryId: string;
  price: number;
  tenantId: string;
  occurredAt: string;
}
