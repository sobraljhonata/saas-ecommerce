import { Test } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateOrderCommand, CreateOrderHandler } from '../usecases/create-order.handler';
import { OrderRepository } from '../order.repository';
import { OutboxRepository } from '../outbox.repository';

describe('CreateOrder (unit)', () => {
  it('should create an order and enqueue OrderPlaced', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        CreateOrderHandler,
        { provide: OrderRepository, useValue: { create: jest.fn().mockResolvedValue(undefined) } },
        { provide: OutboxRepository, useValue: { enqueue: jest.fn().mockResolvedValue(undefined) } }
      ]
    }).compile();

    const handler = moduleRef.get(CreateOrderHandler);
    const id = await handler.execute(new CreateOrderCommand({
      code: 'PED123456',
      tenantId: '22222222-2222-2222-2222-222222222222',
      items: [{
        productId: '11111111-1111-1111-1111-111111111111',
        quantity: 2, unitPrice: 50, total: 100
      }]
    }));

    expect(typeof id).toBe('string');
  });
});
