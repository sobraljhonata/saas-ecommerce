import { Test } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateProductCommand, CreateProductHandler } from '../usecases/create-product.handler';
import { ProductRepository } from '../product.repository';

describe('CreateProduct (unit)', () => {
  it('should create a product and return its id', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        CreateProductHandler,
        {
          provide: ProductRepository,
          useValue: { create: jest.fn().mockResolvedValue(undefined) }
        }
      ]
    }).compile();

    const handler = moduleRef.get(CreateProductHandler);
    const id = await handler.execute(
      new CreateProductCommand({
        name: 'Camisa Azul',
        price: 99.9,
        categoryId: '11111111-1111-1111-1111-111111111111',
        tenantId: '22222222-2222-2222-2222-222222222222'
      })
    );
    expect(typeof id).toBe('string');
  });
});
