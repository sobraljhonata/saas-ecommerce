import { Injectable, Logger, OnModuleDestroy, OnModuleInit, Inject } from '@nestjs/common';
import { createKafka, Topics } from '@saas/shared-kafka';
import { CONFIG, type ConfigToken } from '@saas/shared-config';
import type { OrderConfig } from '@saas/shared-config';
import { OrderRepository } from '../order.repository';
import { KafkaProducerService } from './kafka.producer';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private consumer: import('kafkajs').Consumer | null = null;

  constructor(
    private readonly repo: OrderRepository, 
    private readonly producer: KafkaProducerService, 
    @Inject(CONFIG as ConfigToken<OrderConfig>) private readonly cfg: OrderConfig
  ) {}

  async onModuleInit() {
    const kafka = createKafka(this.cfg.KAFKA_BROKERS);
    this.consumer = kafka.consumer({ groupId: 'svc-order' });
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: Topics.OrderCommands.Confirm, fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const raw = message.value?.toString();
        const input = JSON.parse(raw || '{}');
        const orderId = input.orderId ?? input.payload?.orderId;
        if (!orderId) return;
        this.logger.log(`Confirm command: ${JSON.stringify(raw)}`);
        await this.repo.updateStatus(orderId, 'CONFIRMED');
        await this.producer.send(Topics.OrderEvents.Confirmed, [{
          key: orderId,
          value: JSON.stringify({
            type: 'OrderConfirmed',
            aggregate: 'Order',
            aggregateId: orderId,
            orderId,
            createdAt: new Date().toISOString(),
          }),
        }]);
      },
    });

    this.logger.log('Order consumer started');
  }

  async onModuleDestroy() {
    if (this.consumer) {
      await this.consumer.disconnect();
      this.consumer = null;
    }
  }
}
