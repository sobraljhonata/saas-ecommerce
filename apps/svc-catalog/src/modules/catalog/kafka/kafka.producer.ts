import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createKafka } from '@saas/shared-kafka';
import { loadEnv } from '@saas/shared-config';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private producer: import('kafkajs').Producer | null = null;

  async onModuleInit() {
    const { KAFKA_BROKERS } = loadEnv();
    const kafka = createKafka(KAFKA_BROKERS);
    this.producer = kafka.producer();
    await this.producer.connect();
  }

  async onModuleDestroy() {
    if (this.producer) {
      await this.producer.disconnect();
      this.producer = null;
    }
  }

  async send(topic: string, messages: { key?: string; value: string }[]) {
    if (!this.producer) throw new Error('Kafka producer not initialized');
    await this.producer.send({ topic, messages });
  }
}