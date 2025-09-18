import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { KafkaProducerService } from './kafka/kafka.producer';
import { Topics } from '@saas/shared-kafka';

@Injectable()
export class OutboxPublisher implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxPublisher.name);
  private timer: NodeJS.Timeout | null = null;
  private working = false;
  private readonly intervalMs = 2000;
  private readonly batchSize = 50;

  constructor(
    private readonly prisma: PrismaService,
    private readonly producer: KafkaProducerService,
  ) {}

  onModuleInit() {
    this.timer = setInterval(() => {
      this.tick().catch((err) => this.logger.error(err));
    }, this.intervalMs);
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  private async tick() {
    if (this.working) return;
    this.working = true;
    try {
      const items = await this.prisma.outbox.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'asc' },
        take: this.batchSize,
      });

      if (items.length === 0) return;

      for (const item of items) {
        try {
          await this.producer.send(Topics.Outbox, [
            {
              key: item.aggregateId,
              value: JSON.stringify({
                type: item.type,
                aggregate: item.aggregate,
                aggregateId: item.aggregateId,
                payload: item.payload,
                createdAt: item.createdAt.toISOString(),
              }),
            },
          ]);

          await this.prisma.outbox.update({
            where: { id: item.id },
            data: { status: 'PUBLISHED' },
          });
        } catch (err: any) {
          this.logger.error(`Failed to publish outbox ${item.id}: ${err?.message ?? err}`);
          await this.prisma.outbox.update({
            where: { id: item.id },
            data: { status: 'FAILED' },
          });
        }
      }
    } finally {
      this.working = false;
    }
  }
}
