import { Injectable, Logger, OnModuleDestroy, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { createKafka, Topics, BusEnvelope } from '@saas/shared-kafka';
import { loadEnv } from '@saas/shared-config';
import { RouterService } from '../router/router.service';
import type { Consumer, EachMessagePayload } from 'kafkajs';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private consumer: Consumer | null = null;

  constructor(
    @Inject(forwardRef(() => RouterService)) 
    private readonly router: RouterService) {}

  async onModuleInit() {
    const { KAFKA_BROKERS } = loadEnv();
    const kafka = createKafka(KAFKA_BROKERS);
    this.consumer = kafka.consumer({ groupId: 'orchestrator' });
    await this.consumer.connect();

    await this.consumer.subscribe({ topic: Topics.Outbox, fromBeginning: false });
    await this.consumer.subscribe({ topic: Topics.InventoryEvents.Reserved, fromBeginning: false });
    await this.consumer.subscribe({ topic: Topics.InventoryEvents.Failed, fromBeginning: false });
    await this.consumer.subscribe({ topic: Topics.PaymentEvents.Authorized, fromBeginning: false });
    await this.consumer.subscribe({ topic: Topics.PaymentEvents.Failed, fromBeginning: false });
    await this.consumer.subscribe({ topic: Topics.ShippingEvents.Prepared, fromBeginning: false });
    await this.consumer.subscribe({ topic: Topics.ShippingEvents.Failed, fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ topic, message }: EachMessagePayload) => {
        try {
          const v = message.value?.toString();
          if (!v) return;
          const env = JSON.parse(v) as BusEnvelope;

          if (topic === Topics.InventoryEvents.Reserved && !env.type) env.type = 'InventoryReserved';
          if (topic === Topics.InventoryEvents.Failed && !env.type) env.type = 'InventoryReservationFailed';
          if (topic === Topics.PaymentEvents.Authorized && !env.type) env.type = 'PaymentAuthorized';
          if (topic === Topics.ShippingEvents.Prepared && !env.type) env.type = 'ShippingPrepared';

          await this.router.route(env);
        } catch (err: any) {
          this.logger.error(`Failed to process message: ${err?.message ?? err}`);
        }
      }
    });

    this.logger.log('Kafka consumer started (Outbox + Inventory + Payment + Shipping)');
  }

  async onModuleDestroy() {
    if (this.consumer) {
      await this.consumer.disconnect();
      this.consumer = null;
    }
  }
}
