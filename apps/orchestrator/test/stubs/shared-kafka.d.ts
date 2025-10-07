export declare function __setConsumerMock(c: any): void;
export declare function __setProducerMock(p: any): void;
export type BusEnvelope<T = unknown> = {
    type: string;
    aggregate: string;
    aggregateId: string;
    payload: T;
    createdAt: string;
    messageId?: string;
    tenantId?: string;
};
export declare const Topics: {
    readonly Outbox: "outbox.v1.events";
    readonly OrderCommands: {
        readonly Confirm: "order.v1.commands.confirm";
    };
    readonly OrderEvents: {
        readonly Placed: "order.v1.events.placed";
        readonly Confirmed: "order.v1.events.confirmed";
        readonly Failed: "order.v1.events.failed";
    };
    readonly InventoryCommands: {
        readonly Reserve: "inventory.v1.commands.reserve";
        readonly Release: "inventory.v1.commands.release";
    };
    readonly InventoryEvents: {
        readonly Reserved: "inventory.v1.events.reserved";
        readonly Failed: "inventory.v1.events.failed";
        readonly Released: "inventory.v1.events.released";
    };
    readonly PaymentCommands: {
        readonly Authorize: "payment.v1.commands.authorize";
        readonly Refund: "payment.v1.commands.refund";
    };
    readonly PaymentEvents: {
        readonly Authorized: "payment.v1.events.authorized";
        readonly Failed: "payment.v1.events.failed";
        readonly Refunded: "payment.v1.events.refunded";
    };
    readonly ShippingCommands: {
        readonly Prepare: "shipping.v1.commands.prepare";
    };
    readonly ShippingEvents: {
        readonly Prepared: "shipping.v1.events.prepared";
        readonly Failed: "shipping.v1.events.failed";
    };
};
export declare const createKafka: (_brokers: string) => {
    consumer: (_opts?: any) => any;
    producer: (_opts?: any) => any;
};
