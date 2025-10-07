import { Injectable, Logger, OnModuleDestroy, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { createKafka, Topics, BusEnvelope } from '@saas/shared-kafka';
import { loadEnv } from '@saas/shared-config';
import { RouterService } from '../router/router.service';
import type { Consumer, EachMessagePayload } from 'kafkajs';
import { IdempotencyService } from '../idempotency/idempotency.service';
import { createHash } from 'crypto';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private consumer: Consumer | null = null;

  constructor(
    @Inject(forwardRef(() => RouterService)) 
    private readonly router: RouterService,
    private readonly idem: IdempotencyService
  ) {}

  async onModuleInit() {
    const { KAFKA_BROKERS } = loadEnv();
    const kafka = createKafka(KAFKA_BROKERS);
    const consumer = (this.consumer = kafka.consumer({ groupId: 'orchestrator' }));
    await consumer.connect();

    await consumer.subscribe({ topic: Topics.Outbox, fromBeginning: false });
    await consumer.subscribe({ topic: Topics.InventoryEvents.Reserved, fromBeginning: false });
    await consumer.subscribe({ topic: Topics.InventoryEvents.Failed, fromBeginning: false });
    await consumer.subscribe({ topic: Topics.PaymentEvents.Authorized, fromBeginning: false });
    await consumer.subscribe({ topic: Topics.PaymentEvents.Failed, fromBeginning: false });
    await consumer.subscribe({ topic: Topics.ShippingEvents.Prepared, fromBeginning: false });
    await consumer.subscribe({ topic: Topics.ShippingEvents.Failed, fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, message }: EachMessagePayload) => {
        try {
          const v = message.value?.toString();
          if (!v) return;
          const env = JSON.parse(v) as BusEnvelope;
          // idempotência por messageId (ou hash do payload)
          const msgKey = env.messageId ?? createHash('sha256').update(v).digest('hex');
          const seen = await this.idem.setOnce(`saga:msg:${msgKey}`, 300);
          if (!seen) return;

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
    const consumer = this.consumer;
    if (consumer) {
      await consumer.disconnect();
      this.consumer = null;
    }
  }
}
