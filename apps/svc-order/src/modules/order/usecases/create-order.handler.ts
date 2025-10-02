import { randomUUID } from 'node:crypto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import type { CreateOrderDto } from '../order.dto';
import { OrderRepository } from '../order.repository';
import { OutboxRepository } from '../outbox.repository';

export class CreateOrderCommand {
  constructor(public readonly dto: CreateOrderDto) {}
}

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand, string> {
  constructor(private repo: OrderRepository, private outbox: OutboxRepository) {}

  async execute(command: CreateOrderCommand): Promise<string> {
    const id = randomUUID();
    const items: Array<{
      id: string;
      productId: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }> = command.dto.items.map(it => ({
      id: randomUUID(),
      productId: it.productId,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      total: it.total
    }));
    await this.repo.create({ id, code: command.dto.code, tenantId: command.dto.tenantId, items });
    await this.outbox.enqueue({
      aggregate: 'Order',
      aggregateId: id,
      type: 'OrderPlaced',
      payload: {
        orderId: id,
        code: command.dto.code,
        items: command.dto.items,
        tenantId: command.dto.tenantId,
        occurredAt: new Date().toISOString()
      }
    });
    return id;
  }
}
