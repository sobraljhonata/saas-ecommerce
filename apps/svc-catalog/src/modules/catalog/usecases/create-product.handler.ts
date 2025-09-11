import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'node:crypto';
import { ProductRepository } from '../product.repository';
import { OutboxRepository } from '../outbox.repository'

export class CreateProductCommand {
  constructor(public readonly dto: {
    name: string;
    description?: string;
    imageUrl?: string;
    price: number;
    isBundleOptional?: boolean;
    categoryId: string;
    tenantId: string;
  }) {}
}

@CommandHandler(CreateProductCommand)
export class CreateProductHandler implements ICommandHandler<CreateProductCommand, string> {
  constructor(private repo: ProductRepository, private outbox: OutboxRepository) {}

  async execute(command: CreateProductCommand): Promise<string> {
    const id = randomUUID();
    const isBundleOptional = command.dto.isBundleOptional ?? false;
    await this.repo.create({ id, ...command.dto, isBundleOptional });
    // TODO: persist Outbox event ProductCreated
    await this.outbox.enqueue({
      aggregate: 'Product',
      aggregateId: id,
      type: 'ProductCreated',
      payload: {
        productId: id,
        categoryId: command.dto.categoryId,
        price: command.dto.price,
        tenantId: command.dto.tenantId,
        occurredAt: new Date().toISOString()
      }
    });
    return id;
  }
}
