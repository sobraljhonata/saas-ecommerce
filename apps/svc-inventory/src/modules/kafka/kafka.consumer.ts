import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createKafka, Topics } from '@saas/shared-kafka';
import { loadEnv } from '@saas/shared-config';
import { KafkaProducerService } from './kafka.producer';
import type { Consumer, EachMessagePayload } from 'kafkajs';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private consumer: Consumer | null = null;

  constructor(private readonly producer: KafkaProducerService) { }

  async onModuleInit() {
    const { KAFKA_BROKERS } = loadEnv();
    const kafka = createKafka(KAFKA_BROKERS);
    this.consumer = kafka.consumer({ groupId: 'svc-inventory' });
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: Topics.InventoryCommands.Reserve, fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ message }: EachMessagePayload) => {
        const raw = message.value?.toString();
        if (!raw) return;
        const cmd = JSON.parse(raw);
        this.logger.log(`Reserve command: ${raw}`);

        await this.producer.send(Topics.InventoryEvents.Reserved, [{
          key: cmd.orderId,
          value: JSON.stringify({
            type: 'InventoryReserved',
            aggregate: 'Inventory',
            aggregateId: cmd.orderId,
            payload: { orderId: cmd.orderId, items: cmd.items },
            createdAt: new Date().toISOString()
          })
        }]);
      }
    });

    this.logger.log('Inventory consumer started');
  }

  async onModuleDestroy() {
    if (this.consumer) {
      await this.consumer.disconnect();
      this.consumer = null;
    }
  }
}
