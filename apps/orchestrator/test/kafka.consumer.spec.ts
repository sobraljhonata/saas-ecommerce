import { KafkaConsumerService } from '../src/modules/kafka/kafka.consumer';
import { Topics  } from '@saas/shared-kafka';
import { __setConsumerMock } from '@saas/shared-kafka/testing';

const msg = (value: any) => ({ value: Buffer.from(typeof value === 'string' ? value : JSON.stringify(value)) });

describe('KafkaConsumerService', () => {
  let router: { route: jest.Mock };
  let service: KafkaConsumerService;
  let consumerMock: any;
  let eachMessage!: (args: { topic: string; message: { value?: Buffer } }) => Promise<void>;

  beforeEach(async () => {
    router = { route: jest.fn().mockResolvedValue(undefined) };

    consumerMock = {
      connect: jest.fn().mockResolvedValue(undefined),
      subscribe: jest.fn().mockResolvedValue(undefined),
      run: jest.fn().mockImplementation(async ({ eachMessage: fn }: any) => { eachMessage = fn; }),
      disconnect: jest.fn().mockResolvedValue(undefined),
    };
    __setConsumerMock(consumerMock);

    service = new KafkaConsumerService(router as any);
    await service.onModuleInit();
  });

  it('assina todos os tópicos esperados', () => {
    const subs = consumerMock.subscribe.mock.calls.map((c: any) => c[0].topic).sort();
    expect(subs).toEqual([
      Topics.Outbox,
      Topics.InventoryEvents.Reserved,
      Topics.InventoryEvents.Failed,
      Topics.PaymentEvents.Authorized,
      Topics.PaymentEvents.Failed,
      Topics.ShippingEvents.Prepared,
      Topics.ShippingEvents.Failed,
    ].sort());
  });

  it('InventoryReserved → router.route com type=InventoryReserved', async () => {
    await eachMessage({ topic: Topics.InventoryEvents.Reserved, message: msg({ aggregateId: 'o1' }) });
    const env = router.route.mock.calls.at(-1)[0];
    expect(env.type).toBe('InventoryReserved');
  });

  it('PaymentAuthorized → router.route com type=PaymentAuthorized', async () => {
    await eachMessage({ topic: Topics.PaymentEvents.Authorized, message: msg({ aggregateId: 'o1' }) });
    const env = router.route.mock.calls.at(-1)[0];
    expect(env.type).toBe('PaymentAuthorized');
  });

  it('ShippingPrepared → router.route com type=ShippingPrepared', async () => {
    await eachMessage({ topic: Topics.ShippingEvents.Prepared, message: msg({ aggregateId: 'o1' }) });
    const env = router.route.mock.calls.at(-1)[0];
    expect(env.type).toBe('ShippingPrepared');
  });

  it('mantém type se já vier definido', async () => {
    await eachMessage({ topic: Topics.InventoryEvents.Reserved, message: msg({ type: 'Custom', aggregateId: 'o1' }) });
    const env = router.route.mock.calls.at(-1)[0];
    expect(env.type).toBe('Custom');
  });

  it('ignora sem value', async () => {
    const before = router.route.mock.calls.length;
    await eachMessage({ topic: Topics.Outbox, message: { value: undefined } as any });
    expect(router.route).toHaveBeenCalledTimes(before);
  });

  it('JSON inválido não chama router.route', async () => {
    const before = router.route.mock.calls.length;
    await eachMessage({ topic: Topics.Outbox, message: msg('not-json') });
    expect(router.route).toHaveBeenCalledTimes(before);
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });
});
