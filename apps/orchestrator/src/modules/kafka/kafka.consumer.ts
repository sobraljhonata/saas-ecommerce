import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createKafka, Topics, BusEnvelope } from '@saas/shared-kafka';
import { loadEnv } from '@saas/shared-config';
import { RouterService } from '../router/router.service';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private consumer: import('kafkajs').Consumer | null = null;

  constructor(private readonly router: RouterService) {}

  async onModuleInit() {
    const { KAFKA_BROKERS } = loadEnv();
    const kafka = createKafka(KAFKA_BROKERS);
    this.consumer = kafka.consumer({ groupId: 'orchestrator' });
    await this.consumer.connect();

    await this.consumer.subscribe({ topic: Topics.Outbox, fromBeginning: false });
    await this.consumer.subscribe({ topic: Topics.InventoryEvents.Reserved, fromBeginning: false });
    await this.consumer.subscribe({ topic: Topics.InventoryEvents.Failed, fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          const v = message.value?.toString();
          if (!v) return;
          const env = JSON.parse(v) as BusEnvelope;
          if (topic === Topics.InventoryEvents.Reserved && !env.type) {
            env.type = 'InventoryReserved';
          }
          if (topic === Topics.InventoryEvents.Failed && !env.type) {
            env.type = 'InventoryReservationFailed';
          }
          await this.router.route(env);
        } catch (err: any) {
          this.logger.error(`Failed to process message: ${err?.message ?? err}`);
        }
      }
    });

    this.logger.log('Kafka consumer started (Outbox + Inventory Events)');
  }

  async onModuleDestroy() {
    if (this.consumer) {
      await this.consumer.disconnect();
      this.consumer = null;
    }
  }
}
