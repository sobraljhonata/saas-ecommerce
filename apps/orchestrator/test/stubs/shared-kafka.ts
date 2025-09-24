let __consumerMock: any = null;
let __producerMock: any = null;

export function __setConsumerMock(c: any) { __consumerMock = c; }
export function __setProducerMock(p: any) { __producerMock = p; }

export type BusEnvelope<T = unknown> = {
  type: string;
  aggregate: string;
  aggregateId: string;
  payload: T;
  createdAt: string;
  messageId?: string;
  tenantId?: string;
};

export const Topics = {
  Outbox: 'outbox.v1.events',
  OrderCommands: { Confirm: 'order.v1.commands.confirm' },
  OrderEvents: {
    Placed: 'order.v1.events.placed',
    Confirmed: 'order.v1.events.confirmed',
    Failed: 'order.v1.events.failed',
  },
  InventoryCommands: {
    Reserve: 'inventory.v1.commands.reserve',
    Release: 'inventory.v1.commands.release',
  },
  InventoryEvents: {
    Reserved: 'inventory.v1.events.reserved',
    Failed: 'inventory.v1.events.failed',
    Released: 'inventory.v1.events.released',
  },
  PaymentCommands: {
    Authorize: 'payment.v1.commands.authorize',
    Refund: 'payment.v1.commands.refund',
  },
  PaymentEvents: {
    Authorized: 'payment.v1.events.authorized',
    Failed: 'payment.v1.events.failed',
    Refunded: 'payment.v1.events.refunded',
  },
  ShippingCommands: { Prepare: 'shipping.v1.commands.prepare' },
  ShippingEvents: { Prepared: 'shipping.v1.events.prepared', Failed: 'shipping.v1.events.failed' },
} as const;

// retorna objetos com as mesmas "formas" usadas no SUT
export const createKafka = (_brokers: string) => ({
  consumer: (_opts?: any) => __consumerMock,
  producer: (_opts?: any) => __producerMock,
});
