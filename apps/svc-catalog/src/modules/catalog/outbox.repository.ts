// apps/svc-catalog/src/modules/catalog/outbox.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class OutboxRepository {
  constructor(private prisma: PrismaService) {}
  async enqueue(e: {
    aggregate: string;      // ex: "Product"
    aggregateId: string;
    type: string;           // ex: "ProductCreated"
    payload: unknown;
  }) {
    await this.prisma.outbox.create({
      data: {
        aggregate: e.aggregate,
        aggregateId: e.aggregateId,
        type: e.type,
        payload: e.payload as any,
        status: 'PENDING'
      }
    });
  }
}
