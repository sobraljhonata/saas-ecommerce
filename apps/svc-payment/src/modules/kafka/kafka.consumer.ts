import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createKafka, Topics } from '@saas/shared-kafka';
import { loadEnv } from '@saas/shared-config';
import { KafkaProducerService } from './kafka.producer';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private consumer: import('kafkajs').Consumer | null = null;

  constructor(private readonly producer: KafkaProducerService) {}

  async onModuleInit() {
    const { KAFKA_BROKERS } = loadEnv();
    const kafka = createKafka(KAFKA_BROKERS);
    this.consumer = kafka.consumer({ groupId: 'svc-payment' });
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: Topics.PaymentCommands.Authorize, fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const raw = message.value?.toString();
        if (!raw) return;
        const cmd = JSON.parse(raw);
        this.logger.log(`Authorize command: ${raw}`);

        await this.producer.send(Topics.PaymentEvents.Authorized, [{
          key: cmd.orderId,
          value: JSON.stringify({
            type: 'PaymentAuthorized',
            aggregate: 'Payment',
            aggregateId: cmd.orderId,
            payload: { orderId: cmd.orderId, amount: cmd.amount },
            createdAt: new Date().toISOString(),
          }),
        }]);
      },
    });

    this.logger.log('Payment consumer started');
  }

  async onModuleDestroy() {
    if (this.consumer) {
      await this.consumer.disconnect();
      this.consumer = null;
    }
  }
}
