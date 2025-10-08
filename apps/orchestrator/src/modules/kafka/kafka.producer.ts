import { Injectable, Logger, OnModuleDestroy, OnModuleInit, Inject } from '@nestjs/common';
import { createKafka } from '@saas/shared-kafka';
import { loadEnv } from '@saas/shared-config';
import { CONFIG, type ConfigToken } from '@saas/shared-config';
import type { InventoryConfig } from '@saas/shared-config';
import type { Producer } from 'kafkajs';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private producer: Producer | null = null;

  constructor(@Inject(CONFIG as ConfigToken<InventoryConfig>) private readonly cfg: InventoryConfig) {}
  async onModuleInit() {
    const kafka = createKafka(this.cfg.KAFKA_BROKERS);
     this.producer = kafka.producer();
     await this.producer.connect();
     this.logger.log('Kafka producer connected');
  }

  async onModuleDestroy() {
    const producer = this.producer;
    if (producer) {
      await producer.disconnect();
      this.producer = null;
    }
  }

  async send(topic: string, messages: { key?: string; value: string }[]) {
    const producer = this.producer!;
    await producer.send({ topic, messages });
  }
}
