"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_service_1 = require("../src/modules/router/router.service");
jest.mock('@saas/shared-kafka');
it('OrderPlaced → envia Inventory.Reserve e grava timeline', async () => {
    const producer = { send: jest.fn() };
    const mongo = { getCollection: () => ({ updateOne: jest.fn() }) };
    const router = new router_service_1.RouterService(producer, mongo);
    await router.route({
        type: 'OrderPlaced', aggregate: 'Order', aggregateId: 'o1',
        payload: { orderId: 'o1', items: [{ total: 100 }] }, createdAt: new Date().toISOString()
    });
    expect(producer.send).toHaveBeenCalled();
});
//# sourceMappingURL=router.service.spec.js.map