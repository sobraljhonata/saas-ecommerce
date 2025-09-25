import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { KafkaProducerService } from '../kafka/kafka.producer';
import { KafkaConsumerService } from '../kafka/kafka.consumer';

@Module({
  providers: [PaymentService, KafkaProducerService, KafkaConsumerService],
})
export class PaymentModule {}
