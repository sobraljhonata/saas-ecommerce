import { Injectable, Logger, OnModuleDestroy, OnModuleInit, Inject } from '@nestjs/common';
import { createKafka } from '@saas/shared-kafka';
import { CONFIG, type ConfigToken } from '@saas/shared-config';
import type { ShippingConfig } from '@saas/shared-config';
import type { Producer } from 'kafkajs';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private producer: Producer | null = null;

  constructor(@Inject(CONFIG as ConfigToken<ShippingConfig>) private readonly cfg: ShippingConfig) { }
  async onModuleInit() {
    const kafka = createKafka(this.cfg.KAFKA_BROKERS);
    this.producer = kafka.producer();
    await this.producer.connect();
    this.logger.log('Kafka producer connected');
  }

  async onModuleDestroy() {
    if (this.producer) {
      await this.producer.disconnect();
      this.producer = null;
    }
  }

  async send(topic: string, messages: { key?: string; value: string }[]) {
    if (!this.producer) throw new Error('Kafka producer not initialized');
    const producer = this.producer;
    await producer.send({ topic, messages });
  }
}
