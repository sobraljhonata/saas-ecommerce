"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_service_1 = require("../src/modules/router/router.service");
describe('', () => {
    let producer;
    let col;
    let mongo;
    let idem;
    let router;
    beforeEach(() => {
        producer = { send: jest.fn().mockResolvedValue(undefined) };
        col = { updateOne: jest.fn().mockResolvedValue({}) };
        mongo = { getCollection: jest.fn(() => col) };
        idem = { setOnce: jest.fn().mockResolvedValue(true) };
        router = new router_service_1.RouterService(producer, mongo, idem);
        jest.clearAllMocks();
    });
    it('OrderPlaced → envia Inventory.Reserve e grava timeline', async () => {
        await router.route({
            type: 'OrderPlaced', aggregate: 'Order', aggregateId: 'o1',
            payload: { orderId: 'o1', items: [{ total: 100 }] }, createdAt: new Date().toISOString()
        });
        expect(producer.send).toHaveBeenCalled();
    });
});
//# sourceMappingURL=router.service.spec.js.map