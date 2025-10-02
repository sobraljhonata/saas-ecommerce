import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createKafka, Topics, BusEnvelope } from '@saas/shared-kafka';
import { loadEnv } from '@saas/shared-config';
import type { Consumer, EachMessagePayload } from 'kafkajs';
import { KafkaProducerService } from './kafka.producer';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private consumer!: Consumer;

  constructor(private readonly producer: KafkaProducerService) {}

  async onModuleInit() {
    const { KAFKA_BROKERS } = loadEnv();
    const kafka = createKafka(KAFKA_BROKERS);
    const consumer = (this.consumer = kafka.consumer({ groupId: 'svc-shipping' }));
    await consumer.connect();
    await consumer.subscribe({ topic: Topics.ShippingCommands.Prepare, fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, message }: EachMessagePayload) => {
        const raw = message.value?.toString();
        const input = JSON.parse(raw || '{}');
        const orderId = input.orderId ?? input.payload?.orderId;
        if (!orderId) return;

        const ok = true; // regra simples por enquanto
        const outTopic = ok ? Topics.ShippingEvents.Prepared : Topics.ShippingEvents.Failed;
        const type = ok ? 'ShippingPrepared' : 'ShippingFailed';

        await this.producer.send(outTopic, [{
          key: orderId,
          value: JSON.stringify({
            type, 
            aggregate: 'Shipping', 
            aggregateId: orderId,
            orderId,
            createdAt: new Date().toISOString(),
          }),
        }]);
      }
    });

    this.logger.log('Shipping consumer started');
  }

  async onModuleDestroy() {
    const consumer = this.consumer;
    if (consumer) await consumer.disconnect();
  }
}
