"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Topics = void 0;
exports.createKafka = createKafka;
const kafkajs_1 = require("kafkajs");
function createKafka(brokers) {
    return new kafkajs_1.Kafka({ clientId: "saas-commerce", brokers: brokers.split(",") });
}
exports.Topics = {
    ProductEvents: "catalog.v1.events.product",
    Outbox: "outbox.v1.events"
};
//# sourceMappingURL=index.js.map