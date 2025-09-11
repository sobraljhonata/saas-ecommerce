import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { randomUUID } from 'node:crypto';
import { ProductRepository } from '../product.repository';

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
  constructor(private repo: ProductRepository) {}

  async execute(command: CreateProductCommand): Promise<string> {
    const id = randomUUID();
    const isBundleOptional = command.dto.isBundleOptional ?? false;
    await this.repo.create({ id, ...command.dto, isBundleOptional });
    // TODO: persist Outbox event ProductCreated
    return id;
  }
}
