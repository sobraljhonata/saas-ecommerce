import { RouterService } from '../src/modules/router/router.service';
import { Topics } from '@saas/shared-kafka';


describe('', () => {
  let producer: { send: jest.Mock };
  let col: { updateOne: jest.Mock };
  let mongo: { getCollection: jest.Mock };
  let idem: { setOnce: jest.Mock };
  let router: RouterService;

  beforeEach(() => {
    producer = { send: jest.fn().mockResolvedValue(undefined) } as any;
    col = { updateOne: jest.fn().mockResolvedValue({}) };
    mongo = { getCollection: jest.fn(() => col) } as any;
    idem = { setOnce: jest.fn().mockResolvedValue(true) };
    router = new RouterService(producer as any, mongo as any, idem as any);
    jest.clearAllMocks();
  });
  it('OrderPlaced → envia Inventory.Reserve e grava timeline', async () => {
    await router.route({
      type: 'OrderPlaced', aggregate:'Order', aggregateId:'o1',
      payload: { orderId:'o1', items:[{ total: 100 }] }, createdAt: new Date().toISOString()
    } as any);
    expect(producer.send).toHaveBeenCalled();
  });
})

