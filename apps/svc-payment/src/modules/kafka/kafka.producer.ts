import { Injectable, Logger, OnModuleDestroy, OnModuleInit, Inject } from '@nestjs/common';
import { createKafka } from '@saas/shared-kafka';
import { CONFIG, type ConfigToken } from '@saas/shared-config';
import type { OrderConfig } from '@saas/shared-config';
import type { Producer } from 'kafkajs';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
   private producer: Producer | null = null;

  constructor(@Inject(CONFIG as ConfigToken<OrderConfig>) private readonly cfg: OrderConfig) {}
  async onModuleInit() {
    const kafka = createKafka(this.cfg.KAFKA_BROKERS);
     this.producer = kafka.producer();
     await this.producer.connect();
     this.logger.log('Kafka producer connected');
  }

  async onModuleDestroy() {
    if (this.producer) await this.producer.disconnect();
  }

  async send(topic: string, messages: { key?: string; value: string }[]) {
    if (!this.producer) throw new Error('Kafka producer not initialized');
    await this.producer.send({ topic, messages });
  }
}
