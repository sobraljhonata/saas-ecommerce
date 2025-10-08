import { Injectable, Logger, OnModuleDestroy, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { createKafka, Topics, BusEnvelope } from '@saas/shared-kafka';
import { loadEnv } from '@saas/shared-config';
import type { Consumer, EachMessagePayload } from 'kafkajs';
import { KafkaProducerService } from './kafka.producer';
import { PaymentService } from '../payment/payment.service';
import { CONFIG, type ConfigToken } from '@saas/shared-config';
import type { PaymentConfig } from '@saas/shared-config';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private consumer: Consumer | null = null;

  constructor(
    private readonly producer: KafkaProducerService,
    @Inject(forwardRef(() => PaymentService)) private readonly payment: PaymentService, // 👈
    @Inject(CONFIG as ConfigToken<PaymentConfig>) private readonly cfg: PaymentConfig
  ) { }

  async onModuleInit() {
    const kafka = createKafka(this.cfg.KAFKA_BROKERS);
    const consumer = (this.consumer = kafka.consumer({ groupId: 'payment' }));
    await consumer.connect();
    await this.consumer.subscribe({ topic: Topics.PaymentCommands.Authorize, fromBeginning: false });
    await this.consumer.subscribe({ topic: Topics.PaymentCommands.Refund, fromBeginning: false });

    const rejectOver = this.cfg.REJECT_OVER ? Number(this.cfg.REJECT_OVER) : 999999;

    await this.consumer.run({
      eachMessage: async ({ topic, message }: EachMessagePayload) => {
        const raw = message.value?.toString();
        const input = JSON.parse(raw || '{}');
        const orderId = input.orderId ?? input.payload?.orderId;
        const amount = input.amount ?? Number(input.amount) ?? 0;
        if (!orderId) return;

        if (topic === Topics.PaymentCommands.Authorize) {
          const ok = this.payment.authorize(amount);
          this.logger.debug(`O pagamento está OK? ${ok.authorized}, o valor para rejeitar é ${rejectOver}`)
          const outTopic = ok.authorized ? Topics.PaymentEvents.Authorized : Topics.PaymentEvents.Failed;
          const type = ok.authorized ? 'PaymentAuthorized' : 'PaymentFailed';

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
