import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createKafka, Topics, BusEnvelope } from '@saas/shared-kafka';
import { loadEnv } from '@saas/shared-config';
import type { Consumer, EachMessagePayload } from 'kafkajs';
import { KafkaProducerService } from './kafka.producer';
import { ShippingService } from '../shipping/shipping.service';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private consumer!: Consumer;

  constructor(
    private readonly producer: KafkaProducerService,
    private readonly shipping: ShippingService,
  ) {}

  async onModuleInit() {
    const { KAFKA_BROKERS } = loadEnv();
    const kafka = createKafka(KAFKA_BROKERS);
    this.consumer = kafka.consumer({ groupId: 'svc-shipping' });
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: Topics.ShippingCommands.Prepare, fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ topic, message }: EachMessagePayload) => {
        const raw = message.value?.toString();
        if (!raw) return;
        const env = JSON.parse(raw) as BusEnvelope<any>;
        const { orderId } = env.payload || {};
        if (!orderId) return;

        const ok = this.shipping.prepare();
        const outTopic = ok ? Topics.ShippingEvents.Prepared : Topics.ShippingEvents.Failed;
        const type = ok ? 'ShippingPrepared' : 'ShippingFailed';

        await this.producer.send(outTopic, [{
          key: orderId,
          value: JSON.stringify({
            type, aggregate: 'Shipping', aggregateId: orderId,
            payload: { orderId },
            createdAt: new Date().toISOString(),
          }),
        }]);
      }
    });

    this.logger.log('Shipping consumer started');
  }

  async onModuleDestroy() {
    if (this.consumer) await this.consumer.disconnect();
  }
}
