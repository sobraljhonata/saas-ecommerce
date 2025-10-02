import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createKafka } from '@saas/shared-kafka';
import { loadEnv } from '@saas/shared-config';
import type { Producer } from 'kafkajs';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private producer!: Producer;

  async onModuleInit() {
    const { KAFKA_BROKERS } = loadEnv();
    const kafka = createKafka(KAFKA_BROKERS);
    const producer = (this.producer = kafka.producer());
    await producer.connect();
  }

  async onModuleDestroy() {
    const producer = this.producer;
    if (producer) await producer.disconnect();
  }

  async send(topic: string, messages: { key?: string; value: string }[]) {
    const producer = this.producer;
    await producer.send({ topic, messages });
  }
}
