import { forwardRef, Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createKafka, Topics, BusEnvelope } from '@saas/shared-kafka';
import { loadEnv } from '@saas/shared-config';
import type { Consumer, EachMessagePayload } from 'kafkajs';
import { KafkaProducerService } from './kafka.producer';
import { PaymentService } from '../payment/payment.service';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private consumer!: Consumer;

  constructor(
    private readonly producer: KafkaProducerService,
    @Inject(forwardRef(() => PaymentService)) private readonly payment: PaymentService, // 👈
  ) {}

  async onModuleInit() {
    const { KAFKA_BROKERS } = loadEnv();
    const kafka = createKafka(KAFKA_BROKERS);
    this.consumer = kafka.consumer({ groupId: 'svc-payment' });
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: Topics.PaymentCommands.Authorize, fromBeginning: false });
    await this.consumer.subscribe({ topic: Topics.PaymentCommands.Refund, fromBeginning: false });

    const rejectOver = Number(process.env.REJECT_OVER ?? 999999);

    await this.consumer.run({
      eachMessage: async ({ topic, message }: EachMessagePayload) => {
        const raw = message.value?.toString();
        const input = JSON.parse(raw || '{}');
        const orderId = input.orderId ?? input.payload?.orderId;
        const amount = input.amount ?? input.amount ?? 0;
        if (!orderId) return;

        if (topic === Topics.PaymentCommands.Authorize) {
          const ok = this.payment.authorize(Number(amount ?? 0), rejectOver);
          const outTopic = ok ? Topics.PaymentEvents.Authorized : Topics.PaymentEvents.Failed;
          const type = ok ? 'PaymentAuthorized' : 'PaymentFailed';

          await this.producer.send(outTopic, [{
            key: orderId,
            value: JSON.stringify({
              type, 
              aggregate: 'Payment', 
              aggregateId: orderId,
              orderId, 
              amount,
              createdAt: new Date().toISOString(),
            }),
          }]);
        }

        if (topic === Topics.PaymentCommands.Refund) {
          await this.producer.send(Topics.PaymentEvents.Refunded, [{
            key: orderId,
            value: JSON.stringify({
              type: 'PaymentRefunded',
              aggregate: 'Payment',
              aggregateId: orderId,
              orderId,
              createdAt: new Date().toISOString(),
            }),
          }]);
        }
      }
    });

    this.logger.log('Payment consumer started');
  }

  async onModuleDestroy() {
    if (this.consumer) await this.consumer.disconnect();
  }
}
