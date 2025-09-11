import { Kafka } from "kafkajs";
export declare function createKafka(brokers: string): Kafka;
export declare const Topics: {
    readonly ProductEvents: "catalog.v1.events.product";
    readonly Outbox: "outbox.v1.events";
};
export type ProductCreatedEvent = {
    type: "ProductCreated";
    productId: string;
    categoryId: string;
    price: number;
    tenantId: string;
    occurredAt: string;
};
