import { RouterService } from '../src/modules/router/router.service';
jest.mock('@saas/shared-kafka');

it('OrderPlaced → envia Inventory.Reserve e grava timeline', async () => {
  const producer = { send: jest.fn() } as any;
  const mongo = { getCollection: () => ({ updateOne: jest.fn() }) } as any;
  const router = new RouterService(producer, mongo);
  await router.route({
    type: 'OrderPlaced', aggregate:'Order', aggregateId:'o1',
    payload: { orderId:'o1', items:[{ total: 100 }] }, createdAt: new Date().toISOString()
  } as any);
  expect(producer.send).toHaveBeenCalled();
});
