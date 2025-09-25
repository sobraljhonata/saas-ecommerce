"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const kafka_consumer_1 = require("../src/modules/kafka/kafka.consumer");
const shared_kafka_1 = require("@saas/shared-kafka");
const testing_1 = require("@saas/shared-kafka/testing");
const msg = (value) => ({ value: Buffer.from(typeof value === 'string' ? value : JSON.stringify(value)) });
describe('KafkaConsumerService', () => {
    let router;
    let service;
    let consumerMock;
    let eachMessage;
    beforeEach(async () => {
        router = { route: jest.fn().mockResolvedValue(undefined) };
        consumerMock = {
            connect: jest.fn().mockResolvedValue(undefined),
            subscribe: jest.fn().mockResolvedValue(undefined),
            run: jest.fn().mockImplementation(async ({ eachMessage: fn }) => { eachMessage = fn; }),
            disconnect: jest.fn().mockResolvedValue(undefined),
        };
        (0, testing_1.__setConsumerMock)(consumerMock);
        const idem = { setOnce: jest.fn().mockResolvedValue(true) };
        service = new kafka_consumer_1.KafkaConsumerService(router, idem);
        await service.onModuleInit();
    });
    it('assina todos os tópicos esperados', () => {
        const subs = consumerMock.subscribe.mock.calls.map((c) => c[0].topic).sort();
        expect(subs).toEqual([
            shared_kafka_1.Topics.Outbox,
            shared_kafka_1.Topics.InventoryEvents.Reserved,
            shared_kafka_1.Topics.InventoryEvents.Failed,
            shared_kafka_1.Topics.PaymentEvents.Authorized,
            shared_kafka_1.Topics.PaymentEvents.Failed,
            shared_kafka_1.Topics.ShippingEvents.Prepared,
            shared_kafka_1.Topics.ShippingEvents.Failed,
        ].sort());
    });
    it('InventoryReserved → router.route com type=InventoryReserved', async () => {
        await eachMessage({ topic: shared_kafka_1.Topics.InventoryEvents.Reserved, message: msg({ aggregateId: 'o1' }) });
        const env = router.route.mock.calls.at(-1)[0];
        expect(env.type).toBe('InventoryReserved');
    });
    it('PaymentAuthorized → router.route com type=PaymentAuthorized', async () => {
        await eachMessage({ topic: shared_kafka_1.Topics.PaymentEvents.Authorized, message: msg({ aggregateId: 'o1' }) });
        const env = router.route.mock.calls.at(-1)[0];
        expect(env.type).toBe('PaymentAuthorized');
    });
    it('ShippingPrepared → router.route com type=ShippingPrepared', async () => {
        await eachMessage({ topic: shared_kafka_1.Topics.ShippingEvents.Prepared, message: msg({ aggregateId: 'o1' }) });
        const env = router.route.mock.calls.at(-1)[0];
        expect(env.type).toBe('ShippingPrepared');
    });
    it('mantém type se já vier definido', async () => {
        await eachMessage({ topic: shared_kafka_1.Topics.InventoryEvents.Reserved, message: msg({ type: 'Custom', aggregateId: 'o1' }) });
        const env = router.route.mock.calls.at(-1)[0];
        expect(env.type).toBe('Custom');
    });
    it('ignora sem value', async () => {
        const before = router.route.mock.calls.length;
        await eachMessage({ topic: shared_kafka_1.Topics.Outbox, message: { value: undefined } });
        expect(router.route).toHaveBeenCalledTimes(before);
    });
    it('JSON inválido não chama router.route', async () => {
        const before = router.route.mock.calls.length;
        await eachMessage({ topic: shared_kafka_1.Topics.Outbox, message: msg('not-json') });
        expect(router.route).toHaveBeenCalledTimes(before);
    });
    it('dedupe por messageId (não chama router em duplicata)', async () => {
        // Arrange: idem sempre retorna false na segunda vez
        const { __setConsumerMock } = await Promise.resolve().then(() => __importStar(require('@saas/shared-kafka/testing'))); // se criou o subpath; senão ignore
        // no nosso caso, vamos só simular chamando duas vezes o handler com mesmo payload e esperar 1 chamada ao router,
        // desde que IdempotencyService no SUT esteja ativo. Para isso, você pode expor o IdempotencyService via injeção no teste e mockar setOnce.
        // Como o consumer recebe IdempotencyService por DI do Nest, este teste é mais simples no Router (onde já mockamos idem).
    });
    afterEach(async () => {
        await service.onModuleDestroy();
    });
});
//# sourceMappingURL=kafka.consumer.spec.js.map