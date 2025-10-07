"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKafka = exports.Topics = void 0;
exports.__setConsumerMock = __setConsumerMock;
exports.__setProducerMock = __setProducerMock;
let __consumerMock = null;
let __producerMock = null;
function __setConsumerMock(c) { __consumerMock = c; }
function __setProducerMock(p) { __producerMock = p; }
exports.Topics = {
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
};
// retorna objetos com as mesmas "formas" usadas no SUT
const createKafka = (_brokers) => ({
    consumer: (_opts) => __consumerMock,
    producer: (_opts) => __producerMock,
});
exports.createKafka = createKafka;
//# sourceMappingURL=shared-kafka.js.map